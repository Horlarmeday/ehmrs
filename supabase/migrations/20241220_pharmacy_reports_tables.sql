-- Create pharmacy reports cache table
CREATE TABLE IF NOT EXISTS pharmacy_reports_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  cache_key VARCHAR(255) NOT NULL UNIQUE,
  data JSONB NOT NULL,
  filters JSONB,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacy report schedules table
CREATE TABLE IF NOT EXISTS pharmacy_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
  filters JSONB,
  recipients TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pharmacy alert configs table
CREATE TABLE IF NOT EXISTS pharmacy_alert_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  threshold_value DECIMAL(10,2),
  threshold_days INTEGER,
  is_enabled BOOLEAN DEFAULT true,
  notification_channels TEXT[] DEFAULT ARRAY['email'],
  recipients TEXT[] NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_reports_cache_type_key ON pharmacy_reports_cache(report_type, cache_key);
CREATE INDEX IF NOT EXISTS idx_pharmacy_reports_cache_expires ON pharmacy_reports_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_pharmacy_report_schedules_next_run ON pharmacy_report_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pharmacy_alert_configs_type ON pharmacy_alert_configs(alert_type) WHERE is_enabled = true;

-- Add indexes to existing pharmacy_store_items table for better report performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_store_items_expiry_date ON pharmacy_store_items(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pharmacy_store_items_quantity ON pharmacy_store_items(quantity);
CREATE INDEX IF NOT EXISTS idx_pharmacy_store_items_created_at ON pharmacy_store_items(created_at);
CREATE INDEX IF NOT EXISTS idx_pharmacy_store_items_drug_vendor ON pharmacy_store_items(drug_id, vendor_id);

-- Add indexes to pharmacy_item_history for movement tracking
CREATE INDEX IF NOT EXISTS idx_pharmacy_item_history_created_at ON pharmacy_item_history(created_at);
CREATE INDEX IF NOT EXISTS idx_pharmacy_item_history_action ON pharmacy_item_history(action);
CREATE INDEX IF NOT EXISTS idx_pharmacy_item_history_drug_action ON pharmacy_item_history(drug_id, action);

-- Add RLS policies
ALTER TABLE pharmacy_reports_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_report_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacy_alert_configs ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT ALL PRIVILEGES ON pharmacy_reports_cache TO authenticated;
GRANT ALL PRIVILEGES ON pharmacy_report_schedules TO authenticated;
GRANT ALL PRIVILEGES ON pharmacy_alert_configs TO authenticated;

-- Create RLS policies for authenticated users
CREATE POLICY "Allow authenticated users to manage reports cache" ON pharmacy_reports_cache
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage report schedules" ON pharmacy_report_schedules
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage alert configs" ON pharmacy_alert_configs
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_pharmacy_reports_cache_updated_at
  BEFORE UPDATE ON pharmacy_reports_cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_report_schedules_updated_at
  BEFORE UPDATE ON pharmacy_report_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacy_alert_configs_updated_at
  BEFORE UPDATE ON pharmacy_alert_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default alert configurations
INSERT INTO pharmacy_alert_configs (alert_type, threshold_value, threshold_days, recipients, created_by)
VALUES 
  ('low_stock', 10, NULL, ARRAY['admin@pharmacy.com'], (SELECT id FROM auth.users LIMIT 1)),
  ('near_expiry', NULL, 30, ARRAY['admin@pharmacy.com'], (SELECT id FROM auth.users LIMIT 1)),
  ('expired_items', NULL, 0, ARRAY['admin@pharmacy.com'], (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;