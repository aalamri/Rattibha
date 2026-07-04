-- Customer-facing notifications: new offer on a request, planner
-- countersigning (unlocking payment), booking confirmed after deposit, and
-- new planner messages. Mirrors the notify_planner_* trigger pattern from
-- 0013_planner_notifications.sql and the same event boundaries already used
-- for push notifications in 0007_push_triggers.sql, but targets the
-- request's customer_id instead of the planner.

-- ---------------------------------------------------------------------
-- New offer submitted by a planner on a customer's request
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_customer_new_offer()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_customer_id uuid;
  v_planner_name text;
BEGIN
  SELECT r.customer_id INTO v_customer_id FROM requests r WHERE r.id = NEW.request_id;
  SELECT p.business_name INTO v_planner_name FROM planners p WHERE p.user_id = NEW.planner_id;

  IF v_customer_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, payload)
    VALUES (v_customer_id, 'offer_received', jsonb_build_object(
      'request_id', NEW.request_id,
      'offer_id', NEW.id,
      'planner_id', NEW.planner_id,
      'planner_name', v_planner_name,
      'price', NEW.price
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_new_offer ON offers;
CREATE TRIGGER notify_customer_new_offer
  AFTER INSERT ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_customer_new_offer();

-- ---------------------------------------------------------------------
-- Planner countersigns the contract — customer can now pay the deposit
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_customer_offer_accepted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_customer_id uuid;
  v_planner_name text;
BEGIN
  IF NEW.deal_status = 'countersigned' AND OLD.deal_status IS DISTINCT FROM 'countersigned' THEN
    SELECT r.customer_id INTO v_customer_id FROM requests r WHERE r.id = NEW.request_id;
    SELECT p.business_name INTO v_planner_name FROM planners p WHERE p.user_id = NEW.planner_id;

    IF v_customer_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, payload)
      VALUES (v_customer_id, 'offer_accepted', jsonb_build_object(
        'request_id', NEW.request_id,
        'offer_id', NEW.id,
        'planner_id', NEW.planner_id,
        'planner_name', v_planner_name
      ));
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_offer_accepted ON offers;
CREATE TRIGGER notify_customer_offer_accepted
  AFTER UPDATE OF deal_status ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_customer_offer_accepted();

-- ---------------------------------------------------------------------
-- Booking created (right after the deposit payment succeeds)
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_customer_booking_confirmed()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_customer_id uuid;
  v_request_id uuid;
  v_planner_id uuid;
  v_planner_name text;
BEGIN
  SELECT r.customer_id, o.request_id, o.planner_id, p.business_name
  INTO v_customer_id, v_request_id, v_planner_id, v_planner_name
  FROM contracts c
  JOIN offers o ON o.id = c.offer_id
  JOIN requests r ON r.id = o.request_id
  LEFT JOIN planners p ON p.user_id = o.planner_id
  WHERE c.id = NEW.contract_id;

  IF v_customer_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, payload)
    VALUES (v_customer_id, 'booking_confirmed', jsonb_build_object(
      'booking_id', NEW.id,
      'request_id', v_request_id,
      'planner_id', v_planner_id,
      'planner_name', v_planner_name
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_booking_confirmed ON bookings;
CREATE TRIGGER notify_customer_booking_confirmed
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION notify_customer_booking_confirmed();

-- ---------------------------------------------------------------------
-- New message from a planner on a customer's request thread
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_customer_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- planner_seed is included so the client can deep-link straight into the
  -- chat screen (which takes the avatar seed as a route param, not a fetch).
  INSERT INTO notifications (user_id, type, payload)
  SELECT r.customer_id, 'message', jsonb_build_object(
    'request_id', NEW.request_id,
    'message_id', NEW.id,
    'planner_id', NEW.sender_id,
    'planner_name', p.business_name,
    'planner_seed', pr.avatar_seed,
    'preview', substring(NEW.body from 1 for 80)
  )
  FROM requests r
  LEFT JOIN planners p ON p.user_id = NEW.sender_id
  LEFT JOIN profiles pr ON pr.id = NEW.sender_id
  WHERE r.id = NEW.request_id
    AND r.customer_id != NEW.sender_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_new_message ON messages;
CREATE TRIGGER notify_customer_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_customer_new_message();
