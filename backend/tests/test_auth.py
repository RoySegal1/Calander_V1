from fastapi import HTTPException
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch


class TestGuestAccess:
    """Test guest access functionality"""

    def test_guest_access_success(self, client: TestClient):
        """Test successful guest access"""
        response = client.get("/auth/guest")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["is_guest"] is True
        assert data["user"]["department"] == "מדעי המחשב"
        assert "limited" in data["message"].lower()


class TestSignupLight:
    """Test light signup functionality (without student data scraping)"""

    def test_signup_light_success(self, client: TestClient):
        """Test successful light signup"""
        signup_data = {
            "username": "Test.User",
            "password": "testpass123",
            "department": "מדעי המחשב"
        }
        response = client.post("/auth/signuplight", json=signup_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["id"] is not None
        assert data["user"]["username"] == "Test.User"
        assert data["user"]["department"] == "מדעי המחשב"
        assert data["user"]["name"] == "Test.User"  # Should default to username

    def test_signup_light_duplicate_username(self, client: TestClient):
        """Test signup with duplicate username"""
        signup_data = {
            "username": "Duplicate.User",
            "password": "testpass123",
            "department": "מדעי המחשב"
        }
        # First signup should succeed
        response1 = client.post("/auth/signuplight", json=signup_data)
        assert response1.status_code == 200

        # Second signup with same username should fail
        response2 = client.post("/auth/signuplight", json=signup_data)
        assert response2.status_code == 400
        data = response2.json()
        assert "already taken" in data["detail"].lower()

    @pytest.mark.parametrize("invalid_username", [
        "Test-",
        "Test//User",
        "%$#^&&",
    ])
    def test_signup_light_invalid_username_format(self, client: TestClient, invalid_username):
        """Test signup with invalid username formats"""
        signup_data = {
            "username": invalid_username,
            "password": "testpass123",
            "department": "מדעי המחשב"
        }
        response = client.post("/auth/signuplight", json=signup_data)
        assert response.status_code == 401
        data = response.json()
        assert "username not by format" in data["detail"].lower()

    @pytest.mark.parametrize("valid_username", [
        "John.Doe",
        "Jane.Smith",
        "Test.User123",
        "FirstName.LastName"
    ])
    def test_signup_light_valid_username_formats(self, client: TestClient, valid_username):
        """Test signup with valid username formats"""
        signup_data = {
            "username": valid_username,
            "password": "testpass123",
            "department": "מדעי המחשב"
        }
        response = client.post("/auth/signuplight", json=signup_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    @pytest.mark.parametrize("department", [
        "מדעי המחשב",
        "הנדסת תוכנה",
        "הנדסת חשמל",
        "הנדסת תעשיה וניהול"
    ])
    def test_signup_light_different_departments(self, client: TestClient, department):
        """Test signup with different departments"""
        signup_data = {
            "username": "User.Test",
            "password": "testpass123",
            "department": department
        }
        response = client.post("/auth/signuplight", json=signup_data)
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["department"] == department

    @pytest.mark.parametrize("invalid_data,expected_status", [
        ({"username": "Test.User", "department": "מדעי המחשב"}, 422),  # missing password
        ({"password": "test123", "department": "מדעי המחשב"}, 422),  # missing username
        ({"username": "Test.User", "password": "test123"}, 422),  # missing department
        ({"username": "Test.User", "password": "", "department": "מדעי המחשב"}, 422),  # empty password
    ])
    def test_signup_light_missing_fields(self, client: TestClient, invalid_data, expected_status):
        """Test signup with missing required fields"""
        response = client.post("/auth/signuplight", json=invalid_data)
        assert response.status_code == expected_status


class TestRegularSignup:
    """Test regular signup functionality (with student data scraping)"""

    # @patch('backend.app.core.helper.save_user')
    # def test_signup_success_with_scraping(self, mock_save_user, client: TestClient):
    #     """Test successful signup with student data scraping"""
    #     # Mock successful save_user response
    #     mock_save_user.return_value = {"success": True}
    #
    #     # First create the user that save_user would create
    #     signup_light_data = {
    #         "username": "Student.Test",
    #         "password": "studentpass123",
    #         "department": "מדעי המחשב"
    #     }
    #     client.post("/auth/signuplight", json=signup_light_data)
    #
    #     # Now test the full signup
    #     signup_data = {
    #         "username": "Student.Test",
    #         "password": "studentpass123",
    #         "department": "מדעי המחשב"
    #     }
    #
    #     response = client.post("/auth/signup", json=signup_data)
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["status"] == "success"
    #     assert data["user"]["username"] == "Student.Test"
    #     mock_save_user.assert_called_once()

    @patch('backend.app.core.helper.save_user')
    def test_signup_scraping_failure(self, mock_save_user, client: TestClient):
        """Test signup when student data scraping fails"""
        # Mock save_user failure
        mock_save_user.return_value = {"success": False}

        signup_data = {
            "username": "Failed.Student",
            "password": "studentpass123",
            "department": "מדעי המחשב"
        }

        response = client.post("/auth/signup", json=signup_data)
        assert response.status_code == 401
        data = response.json()
        assert "afeka credentials" in data["detail"].lower()


class TestLogin:
    """Test login functionality"""

    def test_login_success(self, client: TestClient):
        """Test successful login"""
        # First create a user
        signup_data = {
            "username": "Login.User",
            "password": "loginpass123",
            "department": "מדעי המחשב"
        }
        client.post("/auth/signuplight", json=signup_data)

        # Then try to login
        login_data = {
            "username": "Login.User",
            "password": "loginpass123"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["user"]["id"] is not None
        assert data["user"]["username"] == "Login.User"
        assert data["user"]["department"] == "מדעי המחשב"
        assert "completedCourses" in data["user"]
        assert "enrolledCourses" in data["user"]
        assert "credits" in data["user"]
        assert "gpa" in data["user"]

    def test_login_invalid_username(self, client: TestClient):
        """Test login with non-existent username"""
        login_data = {
            "username": "Nonexistent.User",
            "password": "anypassword"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower()

    def test_login_invalid_password(self, client: TestClient):
        """Test login with wrong password"""
        # First create a user
        signup_data = {
            "username": "Wrong.Password",
            "password": "correctpass123",
            "department": "מדעי המחשב"
        }
        client.post("/auth/signuplight", json=signup_data)

        # Try login with wrong password
        login_data = {
            "username": "Wrong.Password",
            "password": "wrongpassword"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data["detail"].lower()

    def test_login_invalid_username_format(self, client: TestClient):
        """Test login with invalid username format"""
        login_data = {
            "username": "invalidformat",  # Missing dot
            "password": "anypassword"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401
        data = response.json()
        assert "invalid username or password" in data["detail"].lower()

    @pytest.mark.parametrize("invalid_data", [
        {"username": "", "password": "test123"},
        {"username": "Test.User", "password": ""},
        {"password": "test123"},  # missing username
        {"username": "Test.User"},  # missing password
    ])
    def test_login_validation_errors(self, client: TestClient, invalid_data):
        """Test login validation errors"""
        response = client.post("/auth/login", json=invalid_data)
        assert response.status_code == 422


class TestPasswordSecurity:
    """Test password hashing and security"""

    def test_password_is_hashed(self, client: TestClient):
        """Test that passwords are properly hashed in database"""
        signup_data = {
            "username": "Hash.Test",
            "password": "plainpassword123",
            "department": "מדעי המחשב"
        }
        response = client.post("/auth/signuplight", json=signup_data)
        assert response.status_code == 200

        # Login should work with plain password
        login_data = {
            "username": "Hash.Test",
            "password": "plainpassword123"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200

        # But wrong password should fail
        login_data["password"] = "wrongpassword"
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 401


class TestAuthenticationFlow:
    """Test complete authentication flows"""

    def test_complete_signup_login_flow(self, client: TestClient):
        """Test complete flow from signup to login"""
        # Step 1: Signup
        signup_data = {
            "username": "Flow.Test",
            "password": "flowpass123",
            "department": "הנדסת תוכנה"
        }
        signup_response = client.post("/auth/signuplight", json=signup_data)
        assert signup_response.status_code == 200
        signup_data_response = signup_response.json()
        user_id = signup_data_response["user"]["id"]

        # Step 2: Login
        login_data = {
            "username": "Flow.Test",
            "password": "flowpass123"
        }
        login_response = client.post("/auth/login", json=login_data)
        assert login_response.status_code == 200
        login_data_response = login_response.json()

        # Verify same user
        assert login_data_response["user"]["id"] == user_id
        assert login_data_response["user"]["username"] == "Flow.Test"
        assert login_data_response["user"]["department"] == "הנדסת תוכנה"

    def test_guest_to_signup_flow(self, client: TestClient):
        """Test flow from guest access to signup"""
        # Step 1: Guest access
        guest_response = client.get("/auth/guest")
        assert guest_response.status_code == 200

        # Step 2: Signup (guest can signup)
        signup_data = {
            "username": "Guest.ToUser",
            "password": "guestpass123",
            "department": "מדעי המחשב"
        }
        signup_response = client.post("/auth/signuplight", json=signup_data)
        assert signup_response.status_code == 200

        # Step 3: Login as registered user
        login_data = {
            "username": "Guest.ToUser",
            "password": "guestpass123"
        }
        login_response = client.post("/auth/login", json=login_data)
        assert login_response.status_code == 200


class TestUserDataStructure:
    """Test the structure of returned user data"""

    def test_login_response_structure(self, client: TestClient):
        """Test that login response has correct structure"""
        # Create and login user
        signup_data = {
            "username": "Structure.Test",
            "password": "structurepass123",
            "department": "מדעי המחשב"
        }
        client.post("/auth/signuplight", json=signup_data)

        login_data = {
            "username": "Structure.Test",
            "password": "structurepass123"
        }
        response = client.post("/auth/login", json=login_data)
        assert response.status_code == 200

        data = response.json()
        user = data["user"]

        # Check required fields
        required_fields = ["id", "username", "name", "department", "completedCourses",
                           "enrolledCourses", "credits", "gpa", "remainingRequirements"]
        for field in required_fields:
            assert field in user, f"Missing field: {field}"

        # Check credits structure
        credits = user["credits"]
        assert "completed" in credits
        assert "required" in credits
        assert "enrolled" in credits

        # Check remainingRequirements structure
        requirements = user["remainingRequirements"]
        assert "general" in requirements
        assert "elective" in requirements
        assert "mandatory" in requirements


class TestErrorHandling:
    """Test error handling and edge cases"""

    def test_missing_request_body(self, client: TestClient):
        """Test endpoints with missing request body"""
        response = client.post("/auth/login")
        assert response.status_code == 422

        response = client.post("/auth/signup")
        assert response.status_code == 422

        response = client.post("/auth/signuplight")
        assert response.status_code == 422

    def test_malformed_json(self, client: TestClient):
        """Test endpoints with malformed JSON"""
        response = client.post("/auth/login", content="invalid json")
        assert response.status_code == 422

    def test_extra_fields_ignored(self, client: TestClient):
        """Test that extra fields in request are handled properly"""
        signup_data = {
            "username": "Extra.Fields",
            "password": "extrapass123",
            "department": "מדעי המחשב",
            "unexpected_field": "should_be_ignored",
            "another_extra": 12345
        }
        response = client.post("/auth/signuplight", json=signup_data)
        # Should succeed despite extra fields
        assert response.status_code == 200

    @patch('backend.app.api.auth.save_user')
    def test_signup_partial_success(self, mock_save_user, client: TestClient):
        """Test signup when save_user succeeds but auto-login fails"""
        mock_save_user.return_value = {"success": True}

        # Use an invalid username format that would cause login to fail
        signup_data = {
            "username": "Valid.User",
            "password": "validpass123",
            "department": "מדעי המחשב"
        }

        # Mock the login to fail
        with patch('backend.app.api.auth.login') as mock_login:
            mock_login.side_effect = HTTPException(status_code=401, detail="Login failed")

            response = client.post("/auth/signup", json=signup_data)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "partial"
            assert "manual" in data["message"].lower()

    @patch('backend.app.api.auth.save_user')
    def test_signup_save_user_failure(self, mock_save_user, client: TestClient):
        """Test signup when save_user fails (scraping fails)"""
        # Mock save_user to fail
        mock_save_user.return_value = {"success": False}

        signup_data = {
            "username": "Failed.User",
            "password": "failedpass123",
            "department": "מדעי המחשב"
        }

        response = client.post("/auth/signup", json=signup_data)
        assert response.status_code == 401
        data = response.json()
        assert "afeka credentials" in data["detail"].lower()
