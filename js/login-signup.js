let loginButton = document.getElementById("login-btn");
let signupButton = document.getElementById("signup-btn");
let accountButton = document.getElementById("login-page");
const userListData = [
  { userEmail: "abc@gmail.com", userPassword: "123456", userName: "Hi" },
];
let userListLocalStorage = JSON.parse(localStorage.getItem("userListData"));
if (!userListLocalStorage) {
  localStorage.setItem("userListData", JSON.stringify(userListData));
  userListLocalStorage = userListData;
}

if (loginButton) {
  loginButton.onclick = function (e) {
    e.preventDefault();
    var userEmail = document.getElementById("email_user");
    var userPassword = document.getElementById("password_user");
    const currentUser = userListLocalStorage.filter(
      (user) => user.userEmail === userEmail.value
    )[0];
    if (currentUser) {
      if (
        userListLocalStorage.filter(
          (user) =>
            user.userEmail === userEmail.value &&
            user.userPassword == userPassword.value
        )[0]
      ) {
        alert("Login Successful");
        localStorage.setItem("currentUser", JSON.stringify(currentUser));
        window.location.href = "../index.html";
      } else {
        alert("Email or Password is wrong");
        userPassword.value = "";
        return;
      }
    } else {
      alert("Email didn't exist in our system");
      userEmail.value = "";
      userPassword.value = "";
      return;
    }
  };
} else if (signupButton) {
  signupButton.onclick = function (e) {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var userEmail = document.getElementById("email_user");
    var userPassword = document.getElementById("password_user");
    var userName = document.getElementById("name_user");
    var userConfirmPW = document.getElementById("confirm_user");
    if (
      !userEmail.value ||
      !userPassword.value ||
      !userName.value ||
      !userConfirmPW.value
    ) {
      alert("Please Fill All Information");
      return;
    } else if (!emailRegex.test(userEmail.value)) {
      alert("Email is not an email");
      userEmail.value = "";
      return;
    } else if (userPassword.value.length < 6) {
      alert("Password needs at least 6 letters");
      userPassword.value = "";
      userConfirmPW.value = "";
      return;
    } else if (userPassword.value != userConfirmPW.value) {
      alert("Confirm password is not match the password");
      userPassword.value = "";
      userConfirmPW.value = "";
      return;
    } else if (
      userListLocalStorage.filter((user) => user.userEmail == userEmail.value)
        .length
    ) {
      alert("This email already existed in system");
      userEmail.value = "";
      return;
    } else {
      const currentUser = {
        userEmail: userEmail.value,
        userPassword: userPassword.value,
        userName: userName.value,
      };
      userListLocalStorage.push(currentUser);
      localStorage.setItem(
        "userListData",
        JSON.stringify(userListLocalStorage)
      );
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      alert("Sign Up Successful");
      window.location.href = "../index.html";
    }
  };
} else if (accountButton) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    accountButton.innerHTML =currentUser.userName;
    accountButton.onclick = function () {
      localStorage.removeItem("currentUser");
      window.location.reload();
    };
  } else {
    accountButton.textContent = "Login";
    accountButton.onclick = function () {
      window.location.href = "../html/login.html";
    };
  }
}
