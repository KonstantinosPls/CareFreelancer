
document.addEventListener('DOMContentLoaded', function () {
  //removing alerts after 5 seconds for ui cleanliness
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(function (alert) {
    setTimeout(function () {
      alert.style.transition = 'opacity 0.5s';
      alert.style.opacity = '0';
      setTimeout(function () {
        alert.remove();
      }, 500);
    }, 5000);
  });

  //print for debugging will remove when completed
  console.log('CareFreelancer loaded successfully');

  // Gig form validation
  const gigForm = document.getElementById('gigForm');
  if (gigForm) {
    // Image preview
    const imageInput = document.getElementById('images');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput && imagePreview) {
      imageInput.addEventListener('change', function (e) {
        imagePreview.innerHTML = '';
        const files = e.target.files;

        if (files.length > 5) {
          alert('You can only upload up to 5 images');
          imageInput.value = '';
          return;
        }

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Check file size (5MB max)
          if (file.size > 5 * 1024 * 1024) {
            alert(`${file.name} is too large. Maximum size is 5MB.`);
            imageInput.value = '';
            imagePreview.innerHTML = '';
            return;
          }

          // Check file type
          if (!file.type.match('image/(jpeg|jpg|png)')) {
            alert(`${file.name} is not a valid image format. Only .jpg, .jpeg, and .png are allowed.`);
            imageInput.value = '';
            imagePreview.innerHTML = '';
            return;
          }

          // Create preview
          const reader = new FileReader();
          reader.onload = function (event) {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.className = 'img-thumbnail me-2 mb-2';
            img.style.width = '100px';
            img.style.height = '100px';
            img.style.objectFit = 'cover';
            imagePreview.appendChild(img);
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Real-time validation
    const titleInput = document.getElementById('title');
    const descriptionInput = document.getElementById('description');
    const priceInput = document.getElementById('price');
    const deliveryTimeInput = document.getElementById('deliveryTime');

    if (titleInput) {
      titleInput.addEventListener('input', function () {
        if (this.value.length < 5) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
    }

    if (descriptionInput) {
      descriptionInput.addEventListener('input', function () {
        if (this.value.length < 20) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
    }

    if (priceInput) {
      priceInput.addEventListener('input', function () {
        if (this.value < 5) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
    }

    if (deliveryTimeInput) {
      deliveryTimeInput.addEventListener('input', function () {
        if (this.value < 1) {
          this.classList.add('is-invalid');
          this.classList.remove('is-valid');
        } else {
          this.classList.remove('is-invalid');
          this.classList.add('is-valid');
        }
      });
    }

    // Form submission validation
    gigForm.addEventListener('submit', function (e) {
      let isValid = true;

      // Check title
      if (titleInput && titleInput.value.length < 5) {
        titleInput.classList.add('is-invalid');
        isValid = false;
      }

      // Check description
      if (descriptionInput && descriptionInput.value.length < 20) {
        descriptionInput.classList.add('is-invalid');
        isValid = false;
      }

      // Check price
      if (priceInput && priceInput.value < 5) {
        priceInput.classList.add('is-invalid');
        isValid = false;
      }

      // Check delivery time
      if (deliveryTimeInput && deliveryTimeInput.value < 1) {
        deliveryTimeInput.classList.add('is-invalid');
        isValid = false;
      }

      // Check if category is selected
      const categoryInputs = document.querySelectorAll('input[name="category"]');
      const categorySelected = Array.from(categoryInputs).some(input => input.checked);
      if (!categorySelected) {
        alert('Please select a category');
        isValid = false;
      }

      if (!isValid) {
        e.preventDefault();
        alert('Please fix the errors in the form');
      }
    });
  }
});
