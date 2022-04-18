"use strict";

import * as helper from "./helper.js";

$(document).ready(function () {
  helper.setFormValidations();
  $(".switch-form").click(function () {
    helper.clearFormInputs();
    helper.toggleAuthForm();
    helper.hideWarningAlert();
  });
  $("#reg-form").submit(async function (event) {
    if (!$("#reg-form")[0].checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      $("#reg-form").addClass("was-validated");
    } else {
      event.preventDefault();
      const formData = helper.getFormData(event.target);

      // post data via register endpoint
      try {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        console.log(data);
        // store token to local storage
        helper.storeToken(data.accessToken);
        helper.hideLoginModal();
        helper.resetForms();
      } catch (err) {
        console.error(err);
      }
    }
  });
  $("#login-form").submit(async function (event) {
    if (!$("#login-form")[0].checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      $("#login-form").addClass("was-validated");
    } else {
      event.preventDefault();
      const formData = helper.getFormData(event.target);

      // post data via login endpoint
      try {
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (res.status === 400 && data.auth === false) {
          // remove token
          helper.removeToken();
          helper.hideWarningAlert();
          helper.showWarningAlert(data.message);
        } else {
          // store token to local storage
          helper.storeToken(data.accessToken);
          helper.hideWarningAlert();
          helper.hideLoginModal();
        }

        helper.resetForms();
      } catch (err) {
        console.error(err);
      }
    }
  });
  $("#search-form").submit(async function (event) {
    event.preventDefault();
    const formData = helper.getFormData(event.target);
    // check if there's a token available
    const token = helper.fetchToken();
    if (token === undefined || token === null || token === "") {
      helper.showLoginModal();
    } else {
      // fetch word via api
      try {
        const res = await fetch(`/api/v1/dictionary?word=${formData.word}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (res.status === 401 && data.message === "Not Authorized") {
          // remove token
          helper.removeToken();
          helper.showLoginModal();
        } else {
          helper.presentData(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
  });
});
