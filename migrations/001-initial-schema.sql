-- Up 
CREATE TABLE EmailRequest (id INTEGER PRIMARY KEY, creationTime INTEGER, request BLOB, attempts INTEGER, lastAttemptTime INTEGER, status TEXT, statusDescription TEXT, provider TEXT);

-- Down
DROP TABLE EmailRequest;