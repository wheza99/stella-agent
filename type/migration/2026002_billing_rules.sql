-- 1. Function to handle Payment Success
CREATE OR REPLACE FUNCTION handle_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid' OR OLD.status IS NULL) THEN
    INSERT INTO usages (org_id, amount, description, type, metadata)
    VALUES (
      NEW.org_id, 
      NEW.amount, 
      'Payment Refill: ' || NEW.name, 
      'refill', 
      jsonb_build_object('payment_id', NEW.id)
    ); -- Log the refill in usages table
    INSERT INTO credits (org_id, total, remain, plan) -- create if not exists
    VALUES (NEW.org_id, NEW.amount, NEW.amount, 'free')
    ON CONFLICT (id) DO NOTHING; -- Assuming 1:1 relation, usually checking org_id is better but id is PK.
    UPDATE credits 
    SET 
      total = total + NEW.amount,
      remain = remain + NEW.amount,
      updated_at = NOW()
    WHERE org_id = NEW.org_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_payment_paid
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_success();

-- 2. Function to handle Usage Deduction
CREATE OR REPLACE FUNCTION handle_usage_deduction()
RETURNS TRIGGER AS $$
DECLARE
  current_credit credits%ROWTYPE;
BEGIN
  IF NEW.type = 'usage' THEN -- Only process 'usage' type
    SELECT * INTO current_credit FROM credits WHERE org_id = NEW.org_id FOR UPDATE; -- Get current credit state
    IF NOT FOUND THEN
      RAISE EXCEPTION 'No credit account found for organization %', NEW.org_id;
    END IF; -- Check if credit account exists
    IF current_credit.remain < NEW.amount THEN
      RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', NEW.amount, current_credit.remain;
    END IF; -- Check sufficiency
    UPDATE credits -- Update credits
    SET 
      used = used + NEW.amount,
      remain = remain - NEW.amount,
      updated_at = NOW()
    WHERE org_id = NEW.org_id;  
  ELSIF NEW.type = 'adjustment' THEN
    UPDATE credits 
    SET 
      remain = remain + NEW.amount, -- Adjustment can be negative
      total = total + NEW.amount,
      updated_at = NOW()
    WHERE org_id = NEW.org_id;
  END IF; -- Handle 'adjustment' type (manual correction)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_usage_created
  BEFORE INSERT ON usages
  FOR EACH ROW
  EXECUTE FUNCTION handle_usage_deduction();

-- 3. Auto-Create Credits for New Organizations
CREATE OR REPLACE FUNCTION initialize_org_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credits (org_id, plan, total, used, remain)
  VALUES (NEW.id, 'free', 0, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_org_created
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_org_credits();

-- 4. Prevent direct manipulation of Credits table (Data Integrity)
CREATE OR REPLACE FUNCTION validate_credit_integrity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.remain := NEW.total - NEW.used; -- Recalculate remain to ensure consistency
  IF NEW.remain < 0 THEN
     RAISE EXCEPTION 'Credit integrity violation: Remaining credits cannot be negative';
  END IF; -- Prevent negative remain (Double check)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER check_credit_integrity
  BEFORE UPDATE ON credits
  FOR EACH ROW
  EXECUTE FUNCTION validate_credit_integrity();
