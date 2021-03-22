import './styles/main.css';

// Please use https://open-platform.theguardian.com/documentation/

//selectors
const newsListElement = document.querySelector('.newsList');
const sectionSelectElement = document.querySelector('#sectionSelect');
const activePageSelectElement = document.querySelector('#activePageSelect');
const readLaterListElement = document.querySelector('.readLaterList');

let currSection = 'search';
let currPage = 1;

const today = new Date(); //today's date
const startDate = new Date(new Date().setDate(today.getDate() - 30))
    .toISOString()
    .slice(0, 10); //30 days ago
const endDate = today.toISOString().slice(0, 10);

const saveToLocalStorage = (e, items) => {
    const item = items[e.target.dataset.index];
    const { id } = item;
    const jsonObj = JSON.stringify(item);
    localStorage.setItem(id, jsonObj);
    readFromLocalStorage();
};

const readFromLocalStorage = () => {
    let values = [];
    let keys = Object.keys(localStorage);
    let i = keys.length;
    while (i--) {
        values.push(JSON.parse(localStorage.getItem(keys[i])));
    }
    const toRender = values
        ?.map(({ webTitle, webUrl, id }) => {
            return `
        <li class="readLaterItem>
        <h4 class="readLaterItem-title">${webTitle}</h4>
        <section>
          <a href="${webUrl}" target="_blank" class="button button-clear">Read</a>
          <button class="button button-clear remove-button" data-id="${id}">Remove</button>
        </section>
      </li>
            `;
        })
        .join('');
    readLaterListElement.innerHTML = toRender;
    const removeButtons = document.querySelectorAll('.remove-button');
    removeButtons.forEach((button) =>
        button.addEventListener('click', (e) => removeFromLocalStorage(e))
    );
};

const removeFromLocalStorage = (e) => {
    const itemId = e.target.dataset.id;
    localStorage.removeItem(itemId);
    readFromLocalStorage();
};

const loadData = async (section, page) => {
    const API_KEY = '7eb760ef-b13f-409e-a7d0-0a7226c8356c';
    const URL = 'https://content.guardianapis.com';
    const slug = section ? section : 'search';
    const pageNr = page ? page : 1;

    const response = await fetch(
        `${URL}/${slug}?api-key=${API_KEY}&page=${pageNr}&from-date=${startDate}&to-date=${endDate}`
    );
    const json = await response.json();
    console.log(json);
    return json;
};

const renderContent = (json) => {
    const PageAmount = json.response.pages;
    const pages = [{}];
    const items = json.response.results;
    const news = items
        ?.map(({ webTitle, sectionName, webPublicationDate, webUrl }, index) => {
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
                        <button class="button button-outline save-button" data-index="${index}">Read Later</button>
                    </section>
                    </article>
                </li>
                `;
        })
        .join('');

    for (let i = 1; i <= PageAmount; i++) {
        pages.push(`<option value="${i}">${i}</option>`);
    }

    //render elements
    activePageSelectElement.innerHTML = pages;
    activePageSelectElement.value = currPage;
    newsListElement.innerHTML = news;
    //add funtions to read later buttons
    const saveButtons = document.querySelectorAll('.save-button');
    saveButtons.forEach((button) =>
        button.addEventListener('click', (e) => saveToLocalStorage(e, items))
    );
};

//initial load data
loadData(currSection).then((data) => renderContent(data));
readFromLocalStorage();

//event listeners
sectionSelectElement?.addEventListener('change', (e) => {
    currSection = e.target.value.toLowerCase();
    if (currSection === 'all') currSection = 'search';
    currPage = 1;
    loadData(currSection, currPage).then((data) => renderContent(data));
});

activePageSelectElement?.addEventListener('change', (e) => {
    currPage = e.target.value;
    loadData(currSection, currPage).then((data) => renderContent(data));
});
