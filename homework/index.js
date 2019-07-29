'use strict';

{
  const HYF_REPOS_URL = 'https://api.github.com/orgs/HackYourFuture/repos?per_page=100';

  function fetchJSON(url, callBackFunction) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status <= 299) {
        callBackFunction(null, xhr.response);
      } else {
        callBackFunction(new Error(`Network error: ${xhr.status} - ${xhr.statusText}`));
      }
    };
    xhr.onerror = () => callBackFunction(new Error('Network request failed'));
    xhr.send();
  }

  function createAndAppend(name, parent, options = {}) {
    const child = document.createElement(name);
    parent.appendChild(child);
    Object.keys(options).forEach(key => {
      const value = options[key];
      if (key === 'text') {
        child.textContent = value;
      } else {
        child.setAttribute(key, value);
      }
    });
    return child;
  }

  function renderError(error) {
    const root = document.getElementById('root');
    createAndAppend('div', root, {
      text: error.message,
      class: 'alert',
    });
  }

  function createOptionElements(repositories, select) {
    repositories
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((repository, index) => {
        createAndAppend('option', select, {
          text: repository.name,
          value: index,
        });
      });
  }

  function addRow(tbody, label, value) {
    const tr = createAndAppend('tr', tbody);
    createAndAppend('td', tr, {
      text: `${label}:`,
      class: 'label',
    });
    createAndAppend('td', tr, {
      text: value,
    });
  }

  function renderRepositories(repository) {
    const leftBox = document.getElementById('left-box');
    leftBox.innerHTML = '';
    const repTable = createAndAppend('table', leftBox);
    const tBody = createAndAppend('tbody', repTable, {
      class: 'table_elms',
    });
    addRow(tBody, 'Repository', '');
    addRow(tBody, 'Description', repository.description);
    addRow(tBody, 'Forks', repository.forks);
    addRow(tBody, 'Updated', new Date(repository.updated_at).toLocaleString('en-GB'));
    createAndAppend('a', tBody.firstChild.lastChild, {
      href: repository.html_url,
      target: '_blank',
      text: repository.name,
    });
  }

  function renderContributions(repository) {
    const rightBox = document.getElementById('right-box');
    rightBox.innerHTML = '';
    fetchJSON(repository.contributors_url, (error, contributions) => {
      if (error) {
        renderError(error);
        return;
      }
      createAndAppend('h2', rightBox, {
        text: 'Contributions',
        class: 'contrib-title',
      });
      const contributionsList = createAndAppend('ul', rightBox, {
        class: 'list-container',
      });
      contributions.forEach(contribution => {
        const listItem = createAndAppend('li', contributionsList, {
          class: 'contrib',
        });
        listItem.addEventListener('click', () => {
          window.open(contribution.html_url, '_blank');
        });
        createAndAppend('img', listItem, {
          class: 'contrib_img',
          src: contribution.avatar_url,
        });
        createAndAppend('span', listItem, {
          class: 'contrib-name',
          text: contribution.login,
        });
        createAndAppend('span', listItem, {
          class: 'contrib-count',
          text: contribution.contributions,
        });
      });
    });
  }

  function main(url) {
    const root = document.getElementById('root');
    const header = createAndAppend('header', root, {
      id: 'header',
    });
    createAndAppend('h1', header, {
      class: 'header-title',
      text: 'HYF Repositories',
    });
    const select = createAndAppend('select', header);
    const container = createAndAppend('main', root, {
      id: 'container',
    });
    fetchJSON(url, (error, repositories) => {
      if (error) {
        renderError(error);
        return;
      }
      createOptionElements(repositories, select);
      createAndAppend('section', container, {
        class: 'left-box',
        id: 'left-box',
      });
      createAndAppend('section', container, {
        class: 'right-box',
        id: 'right-box',
      });
      select.addEventListener('change', () => {
        const repIndex = select.value;
        renderRepositories(repositories[repIndex]);
        renderContributions(repositories[repIndex]);
      });
    });
  }
  window.onload = () => main(HYF_REPOS_URL);
}
