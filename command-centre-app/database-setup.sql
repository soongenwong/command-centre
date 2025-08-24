-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create action_steps table
CREATE TABLE IF NOT EXISTS action_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create completed_dates table (for tracking daily streaks)
CREATE TABLE IF NOT EXISTS completed_dates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(goal_id, completed_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_action_steps_goal_id ON action_steps(goal_id);
CREATE INDEX IF NOT EXISTS idx_completed_dates_goal_id ON completed_dates(goal_id);
CREATE INDEX IF NOT EXISTS idx_completed_dates_date ON completed_dates(completed_date);

-- Enable Row Level Security (RLS)
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_dates ENABLE ROW LEVEL SECURITY;

-- Create policies for goals table
CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for action_steps table
CREATE POLICY "Users can view action steps for their goals" ON action_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = action_steps.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert action steps for their goals" ON action_steps
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = action_steps.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update action steps for their goals" ON action_steps
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = action_steps.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete action steps for their goals" ON action_steps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = action_steps.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

-- Create policies for completed_dates table
CREATE POLICY "Users can view completed dates for their goals" ON completed_dates
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = completed_dates.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert completed dates for their goals" ON completed_dates
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = completed_dates.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete completed dates for their goals" ON completed_dates
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM goals 
            WHERE goals.id = completed_dates.goal_id 
            AND goals.user_id = auth.uid()
        )
    );

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_goals_updated_at 
    BEFORE UPDATE ON goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_steps_updated_at 
    BEFORE UPDATE ON action_steps 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
