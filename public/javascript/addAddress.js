
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('address-form');
  if (form) {
    form.addEventListener('submit', address);
  }
});

function nameValidateChecking(name) {
  const error1 = document.getElementById('error1');
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (name.trim() == "") {
    error1.style.display = "block";
    error1.innerHTML = "Please enter a valid name";
    return false;
  } else if (!namePattern.test(name)) {
    error1.style.display = "block";
    error1.innerHTML = "Name can only contain alphabets and spaces";
    return false;
  } else {
    error1.style.display = "none";
    error1.innerHTML = '';
    return true;
  }
}

function emailValidateChecking(email) {
  const error2 = document.getElementById('error2');
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email == "") {
    error2.style.display = "block";
    error2.innerHTML = "Please enter a valid email";
    return false;
  } else if (!emailPattern.test(email)) {
    error2.style.display = "block";
    error2.innerHTML = "Invalid Email";
    return false;
  } else {
    error2.style.display = "none";
    error2.innerHTML = '';
    return true;
  }
}

function phoneValidateChecking(phone) {
  const error3 = document.getElementById('error3');
  if (phone == "") {
    error3.style.display = "block";
    error3.innerHTML = "Enter a valid phone number";
    return false;
  } else if (phone.length < 10 || phone.length > 10) {
    error3.style.display = "block";
    error3.innerHTML = "Enter 10 digits";
    return false;
  } else {
    error3.style.display = "none";
    error3.innerHTML = "";
    return true;
  }
}

function houseValidatechecking(houseNumber) {
  const error4 = document.getElementById('error4');
  if (houseNumber == '') {
    error4.style.display = 'block';
    error4.innerHTML = 'House number is required';
    return false;
  } else {
    error4.style.display = 'none';
    error4.innerHTML = '';
    return true;
  }
}

function cityValidatechecking(city) {
  const error6 = document.getElementById('error6');
  const cityPattern = /^[a-zA-Z\s'-]+$/;
  if (city == '') {
    error6.style.display = 'block';
    error6.innerHTML = 'City is required';
    return false;
  } else if (!cityPattern.test(city)) {
    error6.style.display = 'block';
    error6.innerHTML = 'City can only contain alphabets';
    return false;
  } else {
    error6.style.display = 'none';
    error6.innerHTML = '';
    return true;
  }
}

function stateValidatechecking(state) {
  const error7 = document.getElementById('error7');
  if (!state || state == 'Choose State...' || state == '') {
    error7.style.display = 'block';
    error7.innerHTML = 'State is required';
    return false;
  } else {
    error7.style.display = 'none';
    error7.innerHTML = '';
    return true;
  }
}

function districtValidastechecking(district) {
  const error8 = document.getElementById('error8');
  const districtPattern = /^[a-zA-Z\s'-]+$/;
  if (district == '') {
    error8.style.display = 'block';
    error8.innerHTML = 'District is required';
    return false;
  } else if (!districtPattern.test(district)) {
    error8.style.display = 'block';
    error8.innerHTML = 'District can only contain alphabets';
    return false;
  } else {
    error8.style.display = 'none';
    error8.innerHTML = '';
    return true;
  }
}

function zipCodeValidatechecking(zipCode) {
  const error9 = document.getElementById('error9');
  if (zipCode == '') {
    error9.style.display = 'block';
    error9.innerHTML = 'Zipcode is required';
    return false;
  } else if (zipCode.length !== 6 || isNaN(zipCode)) {
    error9.style.display = 'block';
    error9.innerHTML = "Zip Code must be 6 digits";
    return false;
  } else {
    error9.style.display = 'none';
    error9.innerHTML = '';
    return true;
  }
}

async function address(event) {
  event.preventDefault();

  const form = document.getElementById('address-form');
  const name = form["name"].value.trim();
  const email = form["email"].value.trim();
  const phone = form["phone"].value.trim();
  const houseNumber = form["houseNumber"].value.trim();
  const city = form["city"].value.trim();
  const state = form["state"].value;
  const district = form["district"].value.trim();
  const zipCode = form["zipCode"].value.trim();

  // Run all validations
  const isNameValid = nameValidateChecking(name);
  const isEmailValid = emailValidateChecking(email);
  const isPhoneValid = phoneValidateChecking(phone);
  const isHouseValid = houseValidatechecking(houseNumber);
  const isCityValid = cityValidatechecking(city);
  const isStateValid = stateValidatechecking(state);
  const isDistrictValid = districtValidastechecking(district);
  const isZipValid = zipCodeValidatechecking(zipCode);

  if (!isNameValid || !isEmailValid || !isPhoneValid || !isHouseValid || !isCityValid || !isStateValid || !isDistrictValid || !isZipValid) {
    return; // Stop submission if validation fails
  }

  const formData = {
    name,
    email,
    phone,
    houseNumber,
    city,
    state,
    district,
    zipCode,
  };

  try {
    const response = await fetch('/address', {
      method: 'POST',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (response.ok) {
      await Swal.fire({
        title: 'Success!',
        text: 'Address added successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      window.location.href = '/getAddress';
    } else {
      throw new Error(data.message || 'Failed to add address');
    }
  } catch (error) {
    console.error("The error ", error);
    await Swal.fire({
      title: 'Error!',
      text: error.message || 'There was an issue with the network. Please try again later.',
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
}
