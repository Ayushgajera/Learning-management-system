// Local Storage Utilities for LMS

// NOTES
export function getLectureNotes(courseId, lectureId) {
  const notes = JSON.parse(localStorage.getItem('lms_notes') || '{}');
  return notes[`${courseId}_${lectureId}`] || '';
}
export function setLectureNotes(courseId, lectureId, note) {
  const notes = JSON.parse(localStorage.getItem('lms_notes') || '{}');
  notes[`${courseId}_${lectureId}`] = note;
  localStorage.setItem('lms_notes', JSON.stringify(notes));
}

// BOOKMARKS
export function getBookmarkedLectures(courseId) {
  const bookmarks = JSON.parse(localStorage.getItem('lms_bookmarks') || '{}');
  return bookmarks[courseId] || [];
}
export function toggleBookmarkLecture(courseId, lectureId) {
  const bookmarks = JSON.parse(localStorage.getItem('lms_bookmarks') || '{}');
  const set = new Set(bookmarks[courseId] || []);
  if (set.has(lectureId)) set.delete(lectureId);
  else set.add(lectureId);
  bookmarks[courseId] = Array.from(set);
  localStorage.setItem('lms_bookmarks', JSON.stringify(bookmarks));
  return bookmarks[courseId];
}

// LAST WATCHED LECTURE
export function getLastWatchedLecture(courseId) {
  const last = JSON.parse(localStorage.getItem('lms_last_watched') || '{}');
  return last[courseId] || null;
}
export function setLastWatchedLecture(courseId, lectureId) {
  const last = JSON.parse(localStorage.getItem('lms_last_watched') || '{}');
  last[courseId] = lectureId;
  localStorage.setItem('lms_last_watched', JSON.stringify(last));
}

// WISHLIST
export function getWishlist() {
  return JSON.parse(localStorage.getItem('lms_wishlist') || '[]');
}
export function toggleWishlist(courseId) {
  const wishlist = new Set(getWishlist());
  if (wishlist.has(courseId)) wishlist.delete(courseId);
  else wishlist.add(courseId);
  localStorage.setItem('lms_wishlist', JSON.stringify(Array.from(wishlist)));
  return Array.from(wishlist);
}
export function isWishlisted(courseId) {
  return getWishlist().includes(courseId);
}

// REVIEWS (mock, per course)
export function getCourseReviews(courseId) {
  const reviews = JSON.parse(localStorage.getItem('lms_reviews') || '{}');
  return reviews[courseId] || [];
}
export function addOrEditReview(courseId, review) {
  const reviews = JSON.parse(localStorage.getItem('lms_reviews') || '{}');
  const arr = reviews[courseId] || [];
  const idx = arr.findIndex(r => r.userId === review.userId);
  if (idx !== -1) arr[idx] = review;
  else arr.push(review);
  reviews[courseId] = arr;
  localStorage.setItem('lms_reviews', JSON.stringify(reviews));
  return arr;
}
export function deleteReview(courseId, userId) {
  const reviews = JSON.parse(localStorage.getItem('lms_reviews') || '{}');
  reviews[courseId] = (reviews[courseId] || []).filter(r => r.userId !== userId);
  localStorage.setItem('lms_reviews', JSON.stringify(reviews));
  return reviews[courseId];
}

// Q&A (mock, per course)
export function getCourseQuestions(courseId) {
  const qna = JSON.parse(localStorage.getItem('lms_qna') || '{}');
  return qna[courseId] || [];
}
export function addQuestion(courseId, question) {
  const qna = JSON.parse(localStorage.getItem('lms_qna') || '{}');
  const arr = qna[courseId] || [];
  arr.push(question);
  qna[courseId] = arr;
  localStorage.setItem('lms_qna', JSON.stringify(qna));
  return arr;
}
export function addAnswer(courseId, questionId, answer) {
  const qna = JSON.parse(localStorage.getItem('lms_qna') || '{}');
  const arr = qna[courseId] || [];
  const q = arr.find(q => q.id === questionId);
  if (q) {
    q.answers = q.answers || [];
    q.answers.push(answer);
  }
  qna[courseId] = arr;
  localStorage.setItem('lms_qna', JSON.stringify(qna));
  return arr;
} 