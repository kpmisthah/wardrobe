
function nameValidateChecking(name) {
  const error1 = document.getElementById('error1')
  const namePattern = /^[a-zA-Z\s'-]+$/;
  if (name.trim() == "") {
    error1.style.display = "block"
    error1.innerHTML = "please enter a valid name"
    //test method is used to weather a string matches a given  regular experssion
  } else if (!namePattern.test(name)) {
    error1.style.display = "block"
    error1.innerHTML = "Name can only contain alpahbets and spaces"
  } else {
    error1.style.display = "none"
    error1.innerHTML = ''
  }
}

function emailValidateChecking(email) {
  const error2 = document.getElementById('error2')
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (email == "") {
    error2.style.display = "block"
    error2.innerHTML = "please enter a valid email"
  } else if (!emailPattern.test(email)) {
    error2.style.display = "block"
    error2.innerHTML = "Invalid Email"
  } else {
    error2.style.display = "none"
    error2.innerHTML = ''
  }
}

function phoneValidateChecking(phone) {
  const error3 = document.getElementById('error3')
  if (phone == "") {
    error3.style.display = "block"
    error3.innerHTML = "Enter a valid phone number"
  } else if (phone.length < 10 || phone.length > 10) {
    error3.style.display = "block"
    error3.innerHTML = "Enter 10 digits"
  } else {
    error3.style.display = "none"
    error3.innerHTML = ""
  }

}

function houseValidatechecking(houseNumber) {
  const error4 = document.getElementById('error4')
  if (houseNumber == '') {
    error4.style.display = 'block'
    error4.innerHTML = 'House number is required'
  } else {
    error4.style.display = 'none'
    error4.innerHTML = ''
  }
}

function cityValidatechecking(city) {
  const error6 = document.getElementById('error6')
  const cityPattern = /^[a-zA-Z\s'-]+$/;
  if (city == '') {
    error6.style.display = 'block'
    error6.innerHTML = 'City is required'
    return false;
  } else if (!cityPattern.test(city)) {
    error6.style.display = 'block'
    error6.innerHTML = 'City can only contain alphabets'
    return false;
  } else {
    error6.style.display = 'none'
    error6.innerHTML = ''
    return true;
  }
}
function stateValidatechecking(state) {
  const error7 = document.getElementById('error7')
  if (state == '') {
    error7.style.display = 'block'
    error7.innerHTML = 'address is required'
  } else {
    error7.style.display = 'none'
    error7.innerHTML = ''
  }
}

function districtValidastechecking(district) {
  const error8 = document.getElementById('error8')
  const districtPattern = /^[a-zA-Z\s'-]+$/;
  if (district == '') {
    error8.style.display = 'block'
    error8.innerHTML = 'District is required'
    return false;
  } else if (!districtPattern.test(district)) {
    error8.style.display = 'block'
    error8.innerHTML = 'District can only contain alphabets'
    return false;
  } else {
    error8.style.display = 'none'
    error8.innerHTML = ''
    return true;
  }
}

function zipCodeValidatechecking(zipCode) {
  const error9 = document.getElementById('error9');
  if (zipCode == '') {
    error9.style.display = 'block'
    error9.innerHTML = 'Zipcode is required'
    return false;
  } else if (zipCode.length !== 6 || isNaN(zipCode)) {
    error9.style.display = 'block'
    error9.innerHTML = "Zip Code must be 6 digits"
    return false;
  }
  else {
    error9.style.display = 'none'
    error9.innerHTML = ''
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
  const addressId = form['addressId'].value;

  const isNameValid = nameValidateChecking(name);
  const isEmailValid = emailValidateChecking(email);
  const isPhoneValid = phoneValidateChecking(phone);
  const isHouseValid = houseValidatechecking(houseNumber);
  const isCityValid = cityValidatechecking(city);
  const isStateValid = stateValidatechecking(state);
  const isDistrictValid = districtValidastechecking(district);
  const isZipValid = zipCodeValidatechecking(zipCode);

  if (!isNameValid || !isEmailValid || !isPhoneValid || !isHouseValid || !isCityValid || !isStateValid || !isDistrictValid || !isZipValid) {
    return;
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
    const response = await fetch(`/edit/${addressId}`, {
      method: 'PUT',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify(formData)
    });
    if (response.ok) {
      await Swal.fire({
        title: 'Success!',
        text: 'Address updated successfully!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      window.location.href = '/getAddress';
    } else {
      Swal.fire('Error', 'Failed to update address. Please try again.', 'error');
    }
  } catch (error) {
    console.log("The error" + error);
    Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
  }
}