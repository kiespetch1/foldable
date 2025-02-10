const current = window.chrome ?? browser;

function addButtonPanel(): void {
  const buttonsContainer = document.createElement("button");
  buttonsContainer.classList.add("floating-buttons");

  const expandButton = document.createElement("button");
  expandButton.classList.add("expand-button");
  expandButton.onclick = expandAll;
  expandButton.title = "Expand all";

  const divider = document.createElement("div");
  divider.classList.add("floating-buttons-divider");

  const collapseButton = document.createElement("button");
  collapseButton.classList.add("collapse-button");
  collapseButton.onclick = collapseAll;
  collapseButton.title = "Collapse all";

  const expandSvg = document.createElement("img");
  expandSvg.src = current.runtime.getURL("images/assets/expand.svg");
  expandSvg.alt = "Expand all";

  const collapseSvg = document.createElement("img");
  collapseSvg.src = current.runtime.getURL("images/assets/collapse.svg");
  collapseSvg.alt = "Collapse all";

  document.body.appendChild(buttonsContainer);
  buttonsContainer.appendChild(expandButton);
  expandButton.appendChild(expandSvg);
  buttonsContainer.appendChild(divider);
  buttonsContainer.appendChild(collapseButton);
  collapseButton.appendChild(collapseSvg);
}

const findAuthWrapperInNode = (node: Node): boolean => {
  if (!(node instanceof Element)) {
    return false;
  }

  if (node.classList.contains("schemes")) {
    return true;
  }

  const found = node.querySelector(".schemes");
  return !!found;
};

const observeWrapper = (): void => {
  const observer = new MutationObserver((mutations, obs) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const addedNode of mutation.addedNodes) {
          if (findAuthWrapperInNode(addedNode)) {
            addButtonPanel();
            obs.disconnect();
            return;
          }
        }
      }

      if (mutation.type === "attributes") {
        if (
          mutation.target instanceof Element &&
          mutation.target.classList.contains("schemes")
        ) {
          addButtonPanel();
          obs.disconnect();
          return;
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });
};

const collapseAll = (): void => {
  const openButtons = document.querySelectorAll(
    'h3.opblock-tag[data-is-open="true"]',
  );
  openButtons.forEach((btn) => {
    if (btn instanceof HTMLElement) btn.click();
  });
};

const expandAll = (): void => {
  const openButtons = document.querySelectorAll(
    'h3.opblock-tag[data-is-open="false"]',
  );
  openButtons.forEach((btn) => {
    if (btn instanceof HTMLElement) btn.click();
  });
};

(() => {
  observeWrapper();
})();
