function createAboutSection() {
    // Create the 'div' and set its id
    const aboutWrapper = document.createElement("div");
    aboutWrapper.id = "about-wrapper";

    // Create the 'table'
    const table = document.createElement("table");

    function createSVG(width, height, link) {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", width); // Set the width of the SVG element
        svg.setAttribute("height", height); // Set the height of the SVG element

        // Create an image in SVG namespace
        const img = document.createElementNS(svgNS, "image");
        img.setAttributeNS("http://www.w3.org/1999/xlink", "href", link);
        img.setAttribute("width", width); // Set the width of the image
        img.setAttribute("height", height); // Set the height of the image
        img.setAttribute("x", "0"); // Set the x position of the image
        img.setAttribute("y", "0"); // Set the y position of the image

        // Append the image to the SVG element
        svg.appendChild(img);

        svg.style.marginLeft = '8px';
        svg.style.color = 'white';

        return svg;
    }

    // Helper function to create a row
    function createRow(thText, tdText, thClass, tdClass) {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        const td = document.createElement("td");

        th.textContent = thText;
        td.innerHTML = tdText; // using innerHTML as tdText could contain HTML tags

        if (thClass) {
            th.className = thClass;
        }

        if (tdClass && tdClass === "my-name") {
            td.className = tdClass;

            const github = createSVG("24", "24", "/assets/svgs/github.svg");
            const linkedin = createSVG("26", "26", "/assets/svgs/linkedin.svg");

            td.appendChild(github);
            td.appendChild(linkedin);
        }

        tr.appendChild(th);
        tr.appendChild(td);

        return tr;
    }

    // Create and append each row to the table
    table.appendChild(createRow("Subject:", "Alec Dieken", "align-bottom-row", "my-name"));
    table.appendChild(createRow("Title:", "Full-Stack Software Engineer"));
    table.appendChild(createRow("Location:", "Oakland, CA, USA"));
    table.appendChild(
        createRow(
            "Summary:",
            `Alec is a full-stack software engineer based in the California Bay Area. His strong passions for helping others and solving challenging
  problems, coupled with his fascination for clean, scalable app design, drives him every day to become the best software engineer he can
  possibly be.`,
            "align-top"
        )
    );

    // Append the table to the aboutWrapper
    aboutWrapper.appendChild(table);

    // Attach aboutWrapper to the body of the document or any other parent element
    document.body.prepend(aboutWrapper);
}
