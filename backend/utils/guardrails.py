import re

class Guardrails:
    def validate_input(self, text: str) -> bool:
        """
        Validates input text to prevent basic injection or malicious patterns.
        Returns True if valid, False otherwise.
        """
        # Example: check for very long inputs or suspicious patterns
        if len(text) > 10000:
            return False
            
        # Basic SQL injection-like pattern check (very naive, for demo)
        # In a real app, use a dedicated library like Guardrails AI
        suspicious_patterns = [
            r"DROP TABLE",
            r"DELETE FROM",
            r"<script>",
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return False
                
        return True

    def validate_output(self, text: str) -> bool:
        """
        Validates the output text.
        """
        # Output should not be empty
        if not text.strip():
            return False
            
        return True
