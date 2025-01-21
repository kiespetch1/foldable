function addFoldButton(): void {
    const wrapper = document.querySelector<HTMLElement>(".schemes.wrapper.block.col-12");
    if (!wrapper) {
        console.log("не удалось найти враппер кнопок")
        return
    } else {
        console.log("враппер кнопок найден")
    }


    const foldButton = document.createElement("button");
    foldButton.classList.add("btn", "authorize", "unlocked");
    const foldButtonContent = document.createElement("span");
    foldButtonContent.textContent = "Fold all";

    const arrowSvg = document.createElement("img");
    arrowSvg.src = chrome.runtime.getURL("images/assets/arrow-down.svg")
    arrowSvg.alt = "Arrow down";

    foldButton.classList.add("flex", "items-center");
    foldButton.appendChild(foldButtonContent);
    foldButton.appendChild(arrowSvg);

    wrapper.id = "buttons-wrapper";
    wrapper.classList.add("flex", "items-center");
    wrapper.appendChild(foldButton);
    console.log("Кнопка добавлена");
}

function findAuthWrapperInNode(node: Node): boolean {
    if (!(node instanceof Element)) {
        return false;
    }

    if (node.classList.contains("schemes")) {
        return true;
    }

    const found = node.querySelector(".schemes");
    return !!found;
}

function observeWrapper(): void {
    const observer = new MutationObserver((mutations, obs) => {
        for (const mutation of mutations) {
            if (mutation.type === "childList") {
                for (const addedNode of mutation.addedNodes) {
                    if (findAuthWrapperInNode(addedNode)) {
                        console.log("Нашли .auth-wrapper в добавленных элементах");
                        addFoldButton();
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
                    console.log("Нашли .auth-wrapper при изменении атрибутов");
                    addFoldButton();
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
}

(function main() {
    if (document.querySelector(".schemes")) {
        console.log("Элемент .auth-wrapper уже есть, добавляем кнопку сразу");
        addFoldButton();
    } else {
        console.log("Элемента .auth-wrapper пока нет, включаем наблюдение");
        observeWrapper();
    }
})();