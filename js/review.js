const reviewForm = document.getElementById("review-form");

if (reviewForm) {
  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const reviewText = document.getElementById("review-text").value;
    const reviewRating = document.getElementById("review-rating").value;

    const review = {
      productId: currentProductId, 
      text: reviewText,
      rating: reviewRating,
      date: new Date().toLocaleString(),
    };

    // Save the review to JSON Server
    const response = await fetch("http://localhost:3000/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(review),
    });

    if (response.ok) {
      Swal.fire({
        title: "Review Submitted!",
        text: "Thank you for your review.",
        icon: "success",
        confirmButtonColor: "#fd5d5c",
      });
      document.getElementById("review-form").reset();
      displayReviews(currentProductId); // Refresh reviews
    } else {
      Swal.fire({
        title: "Error!",
        text: "Failed to submit review. Please try again.",
        icon: "error",
        confirmButtonColor: "#fd5d5c",
      });
    }
  });
} else {
  console.warn("Review form not found on this page.");
}