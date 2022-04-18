"use strict";

/**
 * When the user clicks the button, toggle the class of the registration form to visually-hidden and
 * toggle the class of the login form to visually-hidden.
 */
export function toggleAuthForm() {
  console.log("Switch to Register/Login form");
  $("#reg-form").toggleClass("visually-hidden");
  $("#login-form").toggleClass("visually-hidden");
  if ($("#login-modal-label").text() === "Login") {
    $("#login-modal-label").text("Register");
  } else {
    $("#login-modal-label").text("Login");
  }
}

/**
 * It takes a form element and returns an object with the form's data
 * @param formElem - The form element that you want to get the data from.
 * @returns An object with the form data.
 */
export function getFormData(formElem) {
  const formData = new FormData(formElem);
  const plainFormData = Object.fromEntries(formData.entries());
  console.log(plainFormData);
  return plainFormData;
}

/**
 * It takes the data returned from the API and uses it to populate the HTML elements on the page.
 * @param data - the data returned from the API
 */
export function presentData(data) {
  $("#search-result ul").empty();
  data.shortdef?.forEach((defText) => {
    const li = $(`<li>${defText}</li>`).addClass("mb-2");
    $("#search-result ul").append(li);
  });
  $("#search-img").empty();
  if (data.art?.arturl) {
    const img = $(`<img/>`).attr("src", data.art.arturl).addClass("img-fluid");
    $("#search-img").append(img);
  }
}

/**
 * It takes a token as an argument and stores it in sessionStorage.
 * @param token - The token that you want to store.
 */
export function storeToken(token) {
  if (token) {
    sessionStorage.setItem("token", token);
  }
}

/**
 * If there is a token in session storage, return it. Otherwise, return null.
 * @returns The token from sessionStorage or null.
 */
export function fetchToken() {
  return sessionStorage.getItem("token") || null;
}

/**
 * It removes the token from the session storage.
 */
export function removeToken() {
  sessionStorage.removeItem("token");
}

/**
 * Create a new modal object from the login modal element, and then show it.
 */
export function showLoginModal() {
  const loginModal = new bootstrap.Modal($("#login-modal")[0]);
  loginModal.show();
}

/**
 * Get the instance of the modal with the id of 'login-modal' and hide it.
 */
export function hideLoginModal() {
  const loginModal = bootstrap.Modal.getInstance($("#login-modal")[0]);
  loginModal.hide();
}

/**
 * It sets the required attribute to true for the username, email, password, and confirm password
 * fields in the registration form, and the email and password fields in the login form. It also sets
 * the minimum length of the password fields to 8 characters.
 */
export function setFormValidations() {
  // register username validation
  $("#regUsername").attr("required", true);

  // register email validation
  $("#regEmail").attr("required", true);

  // register password validation
  $("#regPassword").attr("required", true);
  $("#regPassword").attr("minlength", "8");
  $("#regPassword").change(validatePassword);
  $("#regPassword").keyup(validatePassword);

  // register confirm password validation
  $("#regPasswordConfirmation").attr("required", true);
  $("#regPasswordConfirmation").change(validatePassword);
  $("#regPasswordConfirmation").keyup(validatePassword);
  function validatePassword() {
    if ($("#regPassword").val() !== $("#regPasswordConfirmation").val()) {
      $("#regPasswordConfirmation")[0].setCustomValidity(
        "Passwords Don't Match"
      );
    } else {
      $("#regPasswordConfirmation")[0].setCustomValidity("");
    }
  }

  // login email validation
  $("#loginEmail").attr("required", true);

  // login password validation
  $("#loginPassword").attr("required", true);
  $("#loginPassword").attr("minlength", "8");
}

export function showWarningAlert(message) {
  $("#liveAlertPlaceholder").append(buildAlert(message));
}

export function hideWarningAlert() {
  $("#liveAlertPlaceholder").empty();
}

export function buildAlert(message = "message") {
  const div = $("<div>");
  const svg = $("<svg>");
  const use = $("<use>");
  const divMessage = $("<div>");

  div.addClass("alert alert-warning d-flex align-items-center");
  div.attr("role", "alert");
  svg.addClass("bi flex-shrink-0 me-2");
  svg.attr("width", "24");
  svg.attr("height", "24");
  svg.attr("role", "img");
  svg.attr("aria-label", "Warning:");
  use.attr("xlink:href", "#exclamation-triangle-fill");
  divMessage.text(message);

  svg.append(use);
  div.append(svg);
  div.append(divMessage);
  return div;
}

/**
 * It removes the "was-validated" class from the registration and login forms, and then resets them.
 */
export function clearFormInputs() {
  $("#reg-form").removeClass("was-validated");
  $("#login-form").removeClass("was-validated");
  $("#reg-form")[0].reset();
  $("#login-form")[0].reset();
}

/**
 * When the user clicks the login button, hide the registration form and show the login form.
 */
export function setDefaultAuthForm() {
  console.log("Switch to Login form");
  $("#reg-form").addClass("visually-hidden");
  $("#login-form").removeClass("visually-hidden");
}

/**
 * After a half second, clear all form inputs and set the default authentication form.
 */
export function resetForms() {
  setTimeout(function () {
    clearFormInputs();
    setDefaultAuthForm();
  }, 500);
}
