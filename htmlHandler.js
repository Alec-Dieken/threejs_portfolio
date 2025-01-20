/**
 * createAboutSection
 * ------------------
 * Dynamically creates an "About" section containing a table of personal info,
 * as well as GitHub/LinkedIn icon links, and prepends it to the <body> element.
 */
export default function createAboutSection() {
    // Main container for the about section
    const aboutWrapper = document.createElement("div");
    aboutWrapper.id = "about-wrapper";

    // Table to display user's details
    const table = document.createElement("table");

    /**
     * createSVGIcon
     * -------------
     * Helper function that creates an SVG element with a single <path>.
     *
     * @param {Object} svgAttrs  - key-value pairs of attributes for the SVG element
     * @param {Object} pathAttrs - key-value pairs of attributes for the path element
     * @returns {SVGElement}     - the fully constructed <svg> icon
     */
    function createSVGIcon(svgAttrs, pathAttrs) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        // Set attributes on the SVG
        Object.entries(svgAttrs).forEach(([attr, value]) => {
            svg.setAttribute(attr, value);
        });

        // Set attributes on the Path
        Object.entries(pathAttrs).forEach(([attr, value]) => {
            path.setAttribute(attr, value);
        });

        // Append path to SVG
        svg.appendChild(path);
        return svg;
    }

    // Create GitHub Icon & Link
    const githubSVG = createSVGIcon(
        { viewBox: "0 0 16 16", id: "github-icon" },
        {
            d: "M7.999 0C3.582 0 0 3.596 0 8.032a8.031 8.031 0 0 0 5.472 7.621c.4.074.546-.174.546-.387 0-.191-.007-.696-.011-1.366-2.225.485-2.695-1.077-2.695-1.077-.363-.928-.888-1.175-.888-1.175-.727-.498.054-.488.054-.488.803.057 1.225.828 1.225.828.714 1.227 1.873.873 2.329.667.072-.519.279-.873.508-1.074-1.776-.203-3.644-.892-3.644-3.969 0-.877.312-1.594.824-2.156-.083-.203-.357-1.02.078-2.125 0 0 .672-.216 2.2.823a7.633 7.633 0 0 1 2.003-.27 7.65 7.65 0 0 1 2.003.271c1.527-1.039 2.198-.823 2.198-.823.436 1.106.162 1.922.08 2.125.513.562.822 1.279.822 2.156 0 3.085-1.87 3.764-3.652 3.963.287.248.543.738.543 1.487 0 1.074-.01 1.94-.01 2.203 0 .215.144.465.55.386A8.032 8.032 0 0 0 16 8.032C16 3.596 12.418 0 7.999 0z"
        }
    );
    const githubLink = document.createElement("a");
    githubLink.href = "https://github.com/Alec-Dieken";
    githubLink.target = "_blank";
    githubLink.appendChild(githubSVG);

    // Create LinkedIn Icon & Link
    const linkedinSVG = createSVGIcon(
        { viewBox: "0 0 96 96", id: "linkedin-icon" },
        {
            d: "M55.35,44.17h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11ZM50.8,3.77A45.67,45.67,0,1,0,96.47,49.44,45.72,45.72,0,0,0,50.8,3.77ZM39.38,70a.77.77,0,0,1-.77.76h-8.8a.76.76,0,0,1-.76-.76V40.43a.76.76,0,0,1,.76-.77h8.8a.77.77,0,0,1,.77.77ZM33.9,35.71a5.53,5.53,0,1,1,5.53-5.53A5.52,5.52,0,0,1,33.9,35.71ZM76.62,70a.77.77,0,0,1-.77.76h-8.8a.76.76,0,0,1-.76-.76V54.11c0-4.18-1.49-7-5.23-7a5.65,5.65,0,0,0-5.3,3.78,7.12,7.12,0,0,0-.34,2.52V70a.77.77,0,0,1-.77.77h-8.8a.76.76,0,0,1-.76-.77c0-4.22.11-24.71,0-29.53a.76.76,0,0,1,.76-.77h8.78a.76.76,0,0,1,.77.77v3.63a10.26,10.26,0,0,1,9.31-5.13c6.79,0,11.89,4.44,11.89,14Zm-21.2-25.8v-.11l-.07.11Zm-.07,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Zm0,0h.07v-.11Z"
        }
    );
    const linkedinLink = document.createElement("a");
    linkedinLink.href = "https://www.linkedin.com/in/alec-johann-dieken/";
    linkedinLink.target = "_blank";
    linkedinLink.appendChild(linkedinSVG);

    /**
     * createRow
     * ---------
     * Helper function to create a <tr> with one <th> and one <td>.
     *
     * @param {string} thText  - The text content for the <th>
     * @param {string} tdText  - The HTML content for the <td> (can include markup)
     * @param {string} thClass - Optional CSS class for the <th>
     * @param {string} tdClass - Optional CSS class for the <td>
     * @returns {HTMLTableRowElement} - The constructed table row
     */
    function createRow(thText, tdText, thClass, tdClass) {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        const td = document.createElement("td");

        // Assign text content / HTML for table headers and cells
        th.textContent = thText;
        td.innerHTML = tdText;

        // Assign optional classes
        if (thClass) th.className = thClass;
        if (tdClass) {
            td.className = tdClass;
            // Add the GitHub and LinkedIn links only if 'my-name' class is passed
            if (tdClass === "my-name") {
                td.appendChild(document.createElement("br"));
                td.appendChild(githubLink);
                td.appendChild(linkedinLink);
            }
        }

        tr.appendChild(th);
        tr.appendChild(td);

        return tr;
    }

    // Add rows to the table
    table.appendChild(createRow("Subject:", "Alec Dieken", "align-bottom-row", "my-name"));
    table.appendChild(createRow("Title:", "Software Engineer && Web Developer"));
    table.appendChild(createRow("Location:", "Oakland, CA, USA"));
    table.appendChild(
        createRow(
            "Summary:",
            `Alec is a full-stack software engineer based in the California Bay Area. 
             His strong passions for helping others and solving challenging problems, 
             coupled with his fascination for clean, scalable app design, drives him 
             every day to become the best software engineer he can possibly be.`,
            "align-top"
        )
    );

    // Append the table to the wrapper
    aboutWrapper.appendChild(table);

    // Finally, prepend the entire about section to the <body>
    document.body.prepend(aboutWrapper);
}
