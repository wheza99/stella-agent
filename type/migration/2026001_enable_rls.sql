-- Helper function to check if user is a member of an organization
CREATE OR REPLACE FUNCTION is_org_member(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM members
    WHERE org_id = _org_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- 2. Organizations Table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view organizations"
  ON organizations FOR SELECT
  USING (is_org_member(id));
CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update organizations"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM members
      WHERE org_id = organizations.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 3. Members Table
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view other members in same org"
  ON members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.org_id = members.org_id
      AND m.user_id = auth.uid()
    )
    OR user_id = auth.uid() -- Can always see own membership
  );
CREATE POLICY "Admins can manage members"
  ON members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.org_id = members.org_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- 4. Credits Table
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view credits"
  ON credits FOR SELECT
  USING (is_org_member(org_id));

-- 5. Payments Table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view payments"
  ON payments FOR SELECT
  USING (is_org_member(org_id));

-- 6. Usages Table
ALTER TABLE usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view usages"
  ON usages FOR SELECT
  USING (is_org_member(org_id));

-- 7. Projects Table
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view projects"
  ON projects FOR SELECT
  USING (is_org_member(org_id));
CREATE POLICY "Members can create projects"
  ON projects FOR INSERT
  WITH CHECK (is_org_member(org_id));
CREATE POLICY "Members can update projects"
  ON projects FOR UPDATE
  USING (is_org_member(org_id));
CREATE POLICY "Members can delete projects"
  ON projects FOR DELETE
  USING (is_org_member(org_id));

-- 8. Chats Table
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view and manage chats"
  ON chats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = chats.project_id
      AND is_org_member(p.org_id)
    )
  );
