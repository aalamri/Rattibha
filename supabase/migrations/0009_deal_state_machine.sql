-- Enforce the deal state machine at the DB level.
-- Invalid transitions are rejected with a descriptive error so no client
-- can accidentally skip a step regardless of RLS or direct DB access.

CREATE OR REPLACE FUNCTION validate_deal_status_transition()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- No-op if the status didn't change
  IF NEW.deal_status = OLD.deal_status THEN
    RETURN NEW;
  END IF;

  -- Terminal states: no further transitions allowed
  IF OLD.deal_status IN ('declined', 'cancelled', 'reviewed') THEN
    RAISE EXCEPTION 'deal_status transition not allowed: % → %', OLD.deal_status, NEW.deal_status;
  END IF;

  -- Cancellation is always allowed from any non-terminal state
  IF NEW.deal_status = 'cancelled' THEN
    RETURN NEW;
  END IF;

  -- Valid forward transitions
  IF (OLD.deal_status = 'request'       AND NEW.deal_status = 'offer_sent')   OR
     (OLD.deal_status = 'offer_sent'    AND NEW.deal_status IN ('accepted', 'declined')) OR
     (OLD.deal_status = 'accepted'      AND NEW.deal_status = 'countersigned') OR
     (OLD.deal_status = 'countersigned' AND NEW.deal_status = 'deposit_paid')  OR
     (OLD.deal_status = 'deposit_paid'  AND NEW.deal_status = 'completed')     OR
     (OLD.deal_status = 'completed'     AND NEW.deal_status = 'reviewed')
  THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'deal_status transition not allowed: % → %', OLD.deal_status, NEW.deal_status;
END;
$$;

DROP TRIGGER IF EXISTS enforce_deal_status_transition ON offers;
CREATE TRIGGER enforce_deal_status_transition
  BEFORE UPDATE OF deal_status ON offers
  FOR EACH ROW EXECUTE FUNCTION validate_deal_status_transition();

-- Automatically advance deal_status to deposit_paid when a deposit payment is inserted
CREATE OR REPLACE FUNCTION advance_deal_on_deposit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_offer_id uuid;
BEGIN
  IF NEW.type = 'deposit' AND NEW.status = 'paid' THEN
    SELECT offer_id INTO v_offer_id FROM contracts WHERE id = NEW.contract_id;
    IF v_offer_id IS NOT NULL THEN
      UPDATE offers SET deal_status = 'deposit_paid'
      WHERE id = v_offer_id AND deal_status = 'countersigned';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS advance_deal_on_deposit ON payments;
CREATE TRIGGER advance_deal_on_deposit
  AFTER INSERT OR UPDATE OF status ON payments
  FOR EACH ROW EXECUTE FUNCTION advance_deal_on_deposit();

-- Automatically advance deal_status to reviewed when a review is inserted
CREATE OR REPLACE FUNCTION advance_deal_on_review()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_offer_id uuid;
BEGIN
  SELECT c.offer_id INTO v_offer_id
  FROM bookings b
  JOIN contracts c ON c.id = b.contract_id
  WHERE b.id = NEW.booking_id;

  IF v_offer_id IS NOT NULL THEN
    UPDATE offers SET deal_status = 'reviewed'
    WHERE id = v_offer_id AND deal_status = 'completed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS advance_deal_on_review ON reviews;
CREATE TRIGGER advance_deal_on_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION advance_deal_on_review();
