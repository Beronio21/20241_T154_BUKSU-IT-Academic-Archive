-- Create thesis_feedback table
CREATE TABLE IF NOT EXISTS thesis_feedback (
    id SERIAL PRIMARY KEY,
    thesis_id INTEGER NOT NULL,
    comment TEXT NOT NULL,
    status VARCHAR(50) NOT NULL,
    teacher_name VARCHAR(255) NOT NULL,
    teacher_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_email) REFERENCES users(email) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    thesis_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipient_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (thesis_id) REFERENCES theses(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX idx_thesis_feedback_thesis_id ON thesis_feedback(thesis_id);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_email);
CREATE INDEX idx_notifications_thesis ON notifications(thesis_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at); 