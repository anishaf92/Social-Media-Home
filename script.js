// Select the container for posts
const postsContainer = document.getElementById('posts-container');

// Fetch posts, comments, and users data
async function fetchData() {
  try {
    // Fetch posts
    const postsResponse = await fetch('https://jsonplaceholder.typicode.com/posts');
    const posts = await postsResponse.json();

    // Fetch users from the local file
    const usersResponse = await fetch('./data/users.json');
    const users = await usersResponse.json();

    // Render each post
    posts.forEach(async (post) => {
      const user = users.find((u) => u.id === post.userId);
      const userName = user ? user.name : 'Unknown User';
      const userAvatar = `https://picsum.photos/seed/user-${post.userId}/50`; // Unique avatar based on user ID

      displayPost(post, userName, userAvatar);
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Render a single post with a "View Comments" button
function displayPost(post, userName, userAvatar) {
  // Create the post element
  const postElement = document.createElement('div');
  postElement.classList.add('post');

  postElement.innerHTML = `
    <div class="post-header">
      <img src="${userAvatar}" alt="Avatar of ${userName}" class="avatar">
      <div>
        
        <h3> ${userName}</h3>
      </div>
    </div>
    <h3>${post.title}</h3>
    <p>${post.body}</p>
    <div class="comments-block">
    <button class="view-comments-btn" data-post-id="${post.id}"><i class="fa fa-comments comments-icon" aria-hidden="true"></i>View Comments</button></div>
    <div class="comments-container" style="display: none;"></div>
  `;

  // Append the post to the container
  postsContainer.appendChild(postElement);

  // Add event listener to "View Comments" button
  const viewCommentsBtn = postElement.querySelector('.view-comments-btn');
  viewCommentsBtn.addEventListener('click', () => toggleComments(post.id, postElement));
}

// Fetch and toggle comments for a specific post
async function toggleComments(postId, postElement) {
  const commentsContainer = postElement.querySelector('.comments-container');

  // Check if comments are already loaded
  if (commentsContainer.childElementCount === 0) {
    try {
      // Fetch comments for the post
      const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
      const comments = await commentsResponse.json();

      // Render comments
      comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `
          <h4>${comment.email} </h4>
          <h5>${comment.name} </h5>

          <p>${comment.body}</p>

        `;
        commentsContainer.appendChild(commentElement);
      });

      // Show comments container
      commentsContainer.style.display = 'block';
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  } else {
    // Toggle visibility
    commentsContainer.style.display = commentsContainer.style.display === 'none' ? 'block' : 'none';
  }
}

// Load data when the page is ready
document.addEventListener('DOMContentLoaded', fetchData);
