CREATE TABLE IF NOT EXISTS theses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    members TEXT[] NOT NULL,
    adviser_email VARCHAR(255) NOT NULL,
    docs_link TEXT NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    submission_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_email) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (adviser_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE INDEX idx_theses_student_email ON theses(student_email);
CREATE INDEX idx_theses_adviser_email ON theses(adviser_email);
CREATE INDEX idx_theses_status ON theses(status); 