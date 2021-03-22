import './styles/main.css';

// Please use https://open-platform.theguardian.com/documentation/

const newsListElement = document.querySelector('.newsList');
const sectionSelectElement = document.querySelector('#sectionSelect');
const activePageSelectElement = document.querySelector('#activePageSelect');

let currSection = 'search';
let currPage = 1;

const loadData = async (section, page) => {
    const API_KEY = '7eb760ef-b13f-409e-a7d0-0a7226c8356c';
    const URL = 'https://content.guardianapis.com';
    const slug = section ? section : 'search';
    const pageNr = page ? page : 1;

    const response = await fetch(
        `${URL}/${slug}?api-key=${API_KEY}&page=${pageNr}`
    );
    const json = await response.json();
    console.log(json);

    const news = json.response.results
        .map(({ webTitle, sectionName, webPublicationDate, webUrl }) => {
            const date = new Date(webPublicationDate).toLocaleDateString('pl-PL');
            return `
                <li>
                    <article class="news">
                    <header>
                        <h3>${webTitle}</h3>
                    </header>
                    <section class="newsDetails">
                        <ul>
                        <li><strong>Section Name:</strong> ${sectionName}</li>
                        <li><strong>Publication Date:</strong> ${date}</li>
                        </ul>
                    </section>
                    <section class="newsActions">
                        <a href="${webUrl}" target="_blank" class="button">Full article</a>
                        <button class="button button-outline">Read Later</button>
                    </section>
                    </article>
                </li>
                `;
        })
        .join('');

    newsListElement.innerHTML = news;
};

loadData(currSection);

sectionSelectElement.addEventListener('change', (e) => {
    currSection = e.target.value.toLowerCase();
    if (currSection === 'all') currSection = 'search';
    loadData(currSection);
});

activePageSelectElement.addEventListener('change', (e) => {
    currPage = e.target.value;
    console.log(currPage);
    loadData(currSection, currPage);
});
