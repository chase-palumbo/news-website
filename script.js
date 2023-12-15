import dotenv from 'dotenv';

dotenv.config();
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';

const newsDiv = document.querySelector('#news');
const headlinersDiv = document.querySelector('#headliners');
const articlesDiv = document.querySelector('#articles');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.querySelector('#search-input');
const searchBtn = document.querySelector('#search-btn');

const articleState = {
    category: 'general',
    clickedCategoryElement: document.querySelector('#general-btn'),
    search: '',
    articles: [],
};

const generateUrl = (options) => {
    let url = `${NEWS_API_URL}?country=us`;
    if (options.category) url = url + `&category=${options.category}`;
    if (options.search) url = url + `&q=${encodeURI(options.search)}`;
    console.log(url);
    return url;
};

const getTopHeadlines = async () => {
    const API_KEY = process.env.API_KEY;
    const url = generateUrl({ 
        category: articleState.category,
        search: articleState.search
    });

    const response = await fetch(url, {
        headers: {
            'X-Api-Key': API_KEY,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Error fetching articles.');

    const data = await response.json();
    return data.articles;
};

const newArticlesHandler = async () => {
    try {
        const articles = await getTopHeadlines();
        if (articles.length === 0) throw new Error('No articles found.');

        articleState.articles = articles;
        console.log(articleState);
        renderArticles();
    } catch (err) {
        console.log(err);
        renderError(err.message);
    }
};

const renderArticles = () => {
    clearArticles();
    const [headliners, articles] = groupArticles(articleState.articles);
    console.log(headliners, articles);

    if (headliners.length > 0) {
        headliners.forEach(headliner => {
            const html = `
                <div class="headliner">
                    ${headliner.urlToImage ? `<img class="article-img" src=${headliner.urlToImage} alt="article image">` : ''}
                    <a class="article-wrapper" href="${headliner.url}" target="_blank" rel="noopener noreferrer"><p class="headliner-title">${headliner.title}</p></a>
                </div>
            `;
            headlinersDiv.insertAdjacentHTML('beforeend', html);
        });
    }

    if (articles.length > 0) {
        articles.forEach(article => {
            if (article.author) {
                const html = `
                    <div class="article">
                        ${article.urlToImage 
                            ? `<img class="article-img" src=${article.urlToImage} alt="article image">` 
                            : `<div class='newspaper-icon'><i class="fa-regular fa-newspaper"></i></div>`}
                        <a class="article-wrapper" href="${article.url}" target="_blank" rel="noopener noreferrer"><p class="article-title">${article.title}</p></a>
                    </div>
                `;
                articlesDiv.insertAdjacentHTML('beforeend', html);
            }
        })
    }
};

const groupArticles = (articles) => {
    const headliners = [];
    const subArticles = articles.slice();
    for (let i = 0; i < articles.length; i++) {
        if (articles[i].urlToImage) {
            headliners.push(articles[i]);
            subArticles.splice(i, 1);
        }
        if (headliners.length === 2) break;
    }
    return [headliners, subArticles];
};

const clearArticles = () => {
    headlinersDiv.innerHTML = '';
    articlesDiv.innerHTML = '';
    const errorDiv = newsDiv.querySelector('.error-msg');
    if (errorDiv) errorDiv.innerHTML = '';
};

const renderError = (message) => {
    clearArticles();
    const html = `
        <h1 class="error-msg">${message}</h1>
    `;
    newsDiv.insertAdjacentHTML('afterbegin', html);
};


// EXECUTION CODE //

categoryButtons.forEach(element => {
    element.addEventListener('click', (e) => {
        const buttonEl = e.target;
        const category = buttonEl.id.split('-btn')[0];
        if (category != articleState.category) {
            articleState.clickedCategoryElement.classList.remove('clicked-category');
            buttonEl.classList.add('clicked-category');
            articleState.category = category
            articleState.clickedCategoryElement = buttonEl;
            newArticlesHandler();
        }
    });
}); 

searchInput.addEventListener('input', (e) => {
    articleState.search = e.target.value;
});

searchBtn.addEventListener('click', newArticlesHandler);

newArticlesHandler();


// responsive design
