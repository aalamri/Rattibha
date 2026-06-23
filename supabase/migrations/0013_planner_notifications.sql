-- Planner-facing notifications: new requests in the planner's city, new
-- customer messages on a request the planner has quoted, and customer-driven
-- deal_status changes (offer accepted/declined, deposit paid, reviewed).
-- Mirrors the advance_deal_on_* trigger pattern from 0009_deal_state_machine.sql.

-- ---------------------------------------------------------------------
-- New request submitted by a customer, in a planner's city
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_planners_new_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.status = 'open' THEN
    INSERT INTO notifications (user_id, type, payload)
    SELECT p.user_id, 'new_request', jsonb_build_object(
      'request_id', NEW.id,
      'category', NEW.category,
      'city', NEW.city,
      'guests', NEW.guests
    )
    FROM planners p
    WHERE p.city = NEW.city;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_planners_new_request ON requests;
CREATE TRIGGER notify_planners_new_request
  AFTER INSERT ON requests
  FOR EACH ROW EXECUTE FUNCTION notify_planners_new_request();

-- ---------------------------------------------------------------------
-- New customer message on a request a planner has quoted
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_planner_new_message()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, payload)
  SELECT o.planner_id, 'new_message', jsonb_build_object(
    'request_id', NEW.request_id,
    'message_id', NEW.id,
    'preview', substring(NEW.body from 1 for 80)
  )
  FROM offers o
  WHERE o.request_id = NEW.request_id
    AND o.planner_id != NEW.sender_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_planner_new_message ON messages;
CREATE TRIGGER notify_planner_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_planner_new_message();

-- ---------------------------------------------------------------------
-- Customer-driven deal_status changes: accepted, declined, deposit paid,
-- reviewed. Excludes countersigned (the planner's own action) and
-- completed/cancelled (no single customer action drives those).
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION notify_planner_customer_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.deal_status != OLD.deal_status AND NEW.deal_status IN ('accepted', 'declined', 'deposit_paid', 'reviewed') THEN
    INSERT INTO notifications (user_id, type, payload)
    VALUES (NEW.planner_id, 'customer_status', jsonb_build_object(
      'request_id', NEW.request_id,
      'offer_id', NEW.id,
      'deal_status', NEW.deal_status
    ));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_planner_customer_status ON offers;
CREATE TRIGGER notify_planner_customer_status
  AFTER UPDATE OF deal_status ON offers
  FOR EACH ROW EXECUTE FUNCTION notify_planner_customer_status();
