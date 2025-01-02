
function showAddAddressForm() {
    document.getElementById('addressForm').style.display = 'block';
}

function hideAddressForm() {
    document.getElementById('addressForm').style.display = 'none';
}

function selectedAddress(selectedAddress){
    document.querySelectorAll('.address-card').forEach((addr)=>{
        addr.classList.remove('selected')
    })
    document.querySelector(`#addressid-${selectedAddress}`).classList.add('selected')
}

