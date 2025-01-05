const postsPerPage = 10; // Number of posts per page
let currentPage = 1; // Current page
let originalPosts = []; // To store the original unfiltered posts
let allPosts = []; // To store the current working set of posts (filtered or unfiltered)

// Select the container for posts, sidebar, and pagination
const postsContainer = document.getElementById('posts-container');
const sidebar = document.getElementById('sidebar');
const paginationContainer = document.createElement('div');
paginationContainer.id = 'pagination-container';
document.body.appendChild(paginationContainer); // Add pagination container to the page

// Fetch posts, comments, and users data
async function fetchData() {
  try {
    // Fetch posts
    const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts');
    originalPosts = await postsResponse.json();
    allPosts = [...originalPosts]; // Make a copy for filtering and pagination

    // Fetch users from the local file
    const usersResponse = await fetch('./data/users.json');
    const users = await usersResponse.json();

    // Display user list in sidebar
    displayUsersInSidebar(users);

    // Display the first page of posts
    displayPostsForPage(currentPage, users);

    // Add a reset filter button
    addResetFilterButton(users);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Render posts for a specific page
function displayPostsForPage(page, users) {
  // Clear the current posts
  postsContainer.innerHTML = '';

  // Calculate the range of posts to display
  const startIndex = (page - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;

  // Get the posts for the current page
  const postsToDisplay = allPosts.slice(startIndex, endIndex);

  // Render each post
  postsToDisplay.forEach((post) => {
    const user = users.find((u) => u.id === post.userId);
    const userName = user ? user.name : 'Unknown User';
    const userAvatar = `https://picsum.photos/seed/user-${post.userId}/50`; // Unique avatar based on user ID

    displayPost(post, userName, userAvatar);
  });

  // Render pagination controls
  renderPaginationControls(users);
}

// Render a single post with a "View Comments" and "Like" button
function displayPost(post, userName, userAvatar) {
  const postElement = document.createElement('div');
  postElement.classList.add('post');
  postElement.dataset.userId = post.userId;

  postElement.innerHTML = `
    <div class="post-header">
      <img src="${userAvatar}" alt="Avatar of ${userName}" class="avatar">
      <div>
        <h3>${userName}</h3>
      </div>
    </div>
    <h3>${post.title}</h3>
    <p>${post.body}</p>
    <div class="post-footer">
      <button class="like-btn" data-post-id="${post.id}">
        <i class="fa fa-thumbs-up"></i> Like
      </button>
      <button class="view-comments-btn" data-post-id="${post.id}">
        <i class="fa fa-comments"></i> View Comments
      </button>
    </div>
    <div class="comments-container" style="display: none;"></div>
  `;

  postsContainer.appendChild(postElement);

  const likeBtn = postElement.querySelector('.like-btn');
  const viewCommentsBtn = postElement.querySelector('.view-comments-btn');

  likeBtn.addEventListener('click', () => handleLike(likeBtn));
  viewCommentsBtn.addEventListener('click', () => toggleComments(post.id, postElement));
}

// Handle like button
function handleLike(likeBtn) {
  const isLiked = likeBtn.classList.toggle('liked');
  likeBtn.innerHTML = isLiked
    ? '<i class="fa fa-thumbs-up"></i> Unlike'
    : '<i class="fa fa-thumbs-up"></i> Like';
}

// Fetch and toggle comments for a specific post
async function toggleComments(postId, postElement) {
  const commentsContainer = postElement.querySelector('.comments-container');

  if (commentsContainer.childElementCount === 0) {
    try {
      const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
      const comments = await commentsResponse.json();

      comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
          <h4>${comment.email}</h4>
          <h5>${comment.name}</h5>
          <p>${comment.body}</p>
        `;
        commentsContainer.appendChild(commentElement);
      });

      commentsContainer.style.display = 'block';
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  } else {
    commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
  }
}

// Render pagination controls with Next and Previous buttons
function renderPaginationControls(users) {
  paginationContainer.innerHTML = '';
  const totalPages = Math.ceil(allPosts.length / postsPerPage);

  // Add "Previous" button
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Prev <';
  prevBtn.classList.add('pagination-btn');
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayPostsForPage(currentPage, users);
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Add page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.classList.add('pagination-btn');
    pageBtn.textContent = i;

    if (i === currentPage) pageBtn.classList.add('active');

    pageBtn.addEventListener('click', () => {
      currentPage = i;
      displayPostsForPage(currentPage, users);
    });

    paginationContainer.appendChild(pageBtn);
  }

  // Add "Next" button
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next >';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.classList.add('pagination-btn');
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayPostsForPage(currentPage, users);
    }
  });
  paginationContainer.appendChild(nextBtn);
}

// Display user list in the sidebar
function displayUsersInSidebar(users) {
  users.forEach((user) => {
    const userElement = document.createElement('div');
    userElement.classList.add('sidebar-user');
    userElement.innerHTML = `
      <img src="https://picsum.photos/seed/user-${user.id}/50" alt="Avatar of ${user.name}" class="avatar">
      <span>${user.name}</span>
    `;
    userElement.addEventListener('click', () => filterPostsByUser(user.id, users));
    sidebar.appendChild(userElement);
  });
}

// Add a reset filter button to the sidebar
function addResetFilterButton(users) {
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Show All Posts';
  resetBtn.classList.add('reset-filter-btn');
  resetBtn.addEventListener('click', () => {
    currentPage = 1; // Reset to first page
    allPosts = [...originalPosts]; // Reset to the full list
    displayPostsForPage(currentPage, users);
  });
  sidebar.appendChild(resetBtn);
}

// Filter posts by user
function filterPostsByUser(userId, users) {
  currentPage = 1; // Reset to the first page
  allPosts = userId ? originalPosts.filter((post) => post.userId === userId) : [...originalPosts];
  displayPostsForPage(currentPage, users);
}

// Load data when the page is ready
document.addEventListener('DOMContentLoaded', fetchData);
