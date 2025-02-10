const current = window.chrome ?? browser

function addFoldButton(): void {
    const wrapper = document.querySelector<HTMLElement>(".schemes.wrapper.block.col-12");
    const authWrapper = document.querySelector<HTMLElement>(".btn.authorize.unlocked");
    if (!authWrapper) {
        console.error(
            "cannot find .btn.authorize.unlocked element"
        )
        return
    }
    if (!wrapper) {
        console.error(
            "cannot find .schemes.wrapper.block.col-12 element"
        )
        return
    }

    const foldButton = document.createElement("button");
    foldButton.classList.add("btn", "authorize", "unlocked");
    const foldButtonContent = document.createElement("span");
    foldButtonContent.textContent = "Fold all";

    const unfoldButton = document.createElement("button");
    unfoldButton.classList.add("btn", "authorize", "unlocked");
    const unfoldButtonContent = document.createElement("span");
    unfoldButtonContent.textContent = "Unfold all";

    const arrowDownSvg = document.createElement("img");
    arrowDownSvg.src = current.runtime.getURL("images/assets/arrow-down.svg")
    arrowDownSvg.alt = "Arrow down";
    arrowDownSvg.classList.add("mt-2")
    const arrowUpSvg = document.createElement("img");
    arrowUpSvg.src = current.runtime.getURL("images/assets/arrow-up.svg")
    arrowUpSvg.alt = "Arrow up";
    arrowUpSvg.classList.add("mt-2")

    foldButton.classList.add("flex", "items-center");
    foldButton.appendChild(foldButtonContent);
    foldButton.appendChild(arrowUpSvg);
    foldButton.onclick = foldAll;

    unfoldButton.classList.add("flex", "items-center");
    unfoldButton.appendChild(unfoldButtonContent);
    unfoldButton.appendChild(arrowDownSvg);
    unfoldButton.onclick = unfoldAll;

    authWrapper.classList.add("m-0-i");
    wrapper.classList.add("justify-end", "gap-10")
    wrapper.id = "buttons-wrapper";
    wrapper.appendChild(foldButton);
    wrapper.appendChild(unfoldButton);
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
};

const foldAll = (): void => {
    const openButtons = document.querySelectorAll('h3.opblock-tag[data-is-open="true"]');
    openButtons.forEach((btn) => {
        if (btn instanceof HTMLElement)
            btn.click();
    });
};

const unfoldAll = (): void => {
    const openButtons = document.querySelectorAll('h3.opblock-tag[data-is-open="false"]');
    openButtons.forEach((btn) => {
        if (btn instanceof HTMLElement)
            btn.click();
    });
};

(() => {
        observeWrapper();
})();