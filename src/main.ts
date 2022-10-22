import {
  once,
  setRelaunchButton,
  showUI,
} from "@create-figma-plugin/utilities";

import { CreatePageHandler } from "./types";

export default async function () {
  setRelaunchButton(figma.currentPage, "designToolkit", {
    description: "Useful tools and links",
  });

  once<CreatePageHandler>("CREATE_PAGES", function () {
    // This is the list of pages to create in your document.
    const pages = [
      {
        name: "📐 Designs (Hi-Fi)",
        node: "PAGE",
        // title: "High Fidelity",
        // description: "High Fidelity Designs",
      },
      {
        name: "🛠 Flows & Wires (Lo-Fi)",
        node: "PAGE",
        // title: "Low Fidelity",
        // description: "User flows & wire frames",
      },
      {
        name: "🎥 Prototype",
        node: "PAGE",
        // title: "Prototype",
        // description: "Interactive prototype",
      },
      {
        name: "📁 Docs & Info",
        node: "PAGE",
        // title: "Docs & Info",
        // description: "Relevant Documentation",
      },
      { 
        name: "🖼 Thumbnail",
        node: "PAGE",
        title: "Cover", 
        description: "Thumbnail",
      },
      {
        name: "☠️Graveyard",
        node: "PAGE",
        // title: "Graveyard",
        // description: "Unused designs, wire frames, flows",
      },
    ];

    // Show a notification

    figma.notify("Building template", { timeout: Infinity });

    // Load any custom fonts required for editing text layers.
    // Figma developer console will advise you if you need to include any missing fonts.

    async function loadFont() {
      figma.loadFontAsync({ family: "Work Sans", style: "Bold" });
      figma.loadFontAsync({ family: "Open Sans", style: "Regular" });
      figma.loadFontAsync({ family: "Open Sans", style: "SemiBold" });
    }

    function insertTitle(pageName: string) {
      let matchPage = pages.filter((page) => page.name === pageName)[0];
      if (matchPage.title == null) {
        console.error("No title added on: " + matchPage.name);
      } else {
        if (pageTitleComponent) {
          let titleInstance: InstanceNode = pageTitleComponent.createInstance();

          let replaceTitle: any = titleInstance.findOne(
            (n) => n.name === "pageTitle" && n.type === "TEXT"
          );

          if (replaceTitle && replaceTitle.type === "TEXT") {
            replaceTitle.characters = matchPage.title;
          }

          let replaceDescription: any = titleInstance.findOne(
            (n) => n.name === "pageDescription" && n.type === "TEXT"
          );

          if (replaceDescription && replaceDescription.type === "TEXT") {
            replaceDescription.characters = matchPage.description;
          }
          figma.viewport.scrollAndZoomIntoView([titleInstance]);
        }
      }
    }

    // Setup your components for import into pages

    // Cover component
    let coverComponent: ComponentNode | null = null;

    async function getCoverComponent() {
      const coverComponentKey = "dd3e1f3b5c129e48dc0ec743fbc5cd4e59a8efdd"; // Replace this with the Key for your cover component.
      const instance = await figma.importComponentByKeyAsync(coverComponentKey);
      coverComponent = instance;
    }

    // Title component
    let pageTitleComponent: ComponentNode | null = null;

    async function getPageTitleComponent() {
      const pageTitleComponentKey = "205c84ad43824305323495bc487fb2e38773e34c"; // Replace this with the Key for your title component.
      const instance = await figma.importComponentByKeyAsync(pageTitleComponentKey);
      pageTitleComponent = instance;
    }

    // Example of a component to be imported
    let exampleComponent: ComponentNode | null = null;

    async function getExampleComponent() {
      const exampleComponentKey = "5a0a037a326c91b00e0febb363656d3aa1da8f65"; // This is an example component, use this block as a reference when for importing additional components
      const instance = await figma.importComponentByKeyAsync(exampleComponentKey);
      exampleComponent = instance;
    }

    // The following section is contained within a Promise, which means it only runs when the above components and fonts are available.

    Promise.all([
      getCoverComponent(),
      getPageTitleComponent(),
      getExampleComponent(),
      loadFont(),
    ]).then(() => {
      console.log("%cFonts and components loaded", "color:green");

      // This forEach loop goes through the list of pages and creates each one using the 'name' values.
      let createdPages: PageNode[] = []
      pages.forEach((page) => {
        const newPage = figma.createPage();
        newPage.name = page.name;
        if (newPage.name !== 'Cover') {
          figma.currentPage = newPage;
          insertTitle(page.name);
        }
        createdPages.push(newPage) // Inserts the heading component from library if there is a "title" value in your pages array.
      });

      console.log("%cPages built", "color:green");

      // Switch to page called "Cover"
      const coverPage = createdPages.filter((page) => page.name === "Cover")[0];
      figma.currentPage = coverPage;

      // Insert Cover component instance
      if (coverComponent) {
        const coverInstance: InstanceNode = coverComponent.createInstance();

        // Find the text layer called "Title" and replaces it with the value of titleText.
        const titleText = "Title";

        const coverTitle = coverInstance.findOne(
          (n) => n.name === "title" && n.type === "TEXT"
        );
        if (coverTitle && coverTitle.type === "TEXT") {
          coverTitle.characters = titleText;
        }

        // Find the text layer called "description" and replaces it with the value of descriptionText.
        const descriptionText = "Enter a description for this file.";

        const coverDescription = coverInstance.findOne(
          (n) => n.name === "description" && n.type === "TEXT"
        );
        if (coverDescription && coverDescription.type === "TEXT") {
          coverDescription.characters = descriptionText;
        }
        // Find the text layer called 'userName' and replaces it with the value of authorName.
        if(figma.currentUser) {
          const authorName = figma.currentUser.name;
          const coverAuthor = coverInstance.findOne(
            (n) => n.name === "userName" && n.type === "TEXT"
          );
          if (coverAuthor && coverAuthor.type === "TEXT") {
            coverAuthor.characters = authorName;
          }
        }

        // Get the current month and year, if you'd like a date stamp on your cover
        let monthIndex: number = new Date().getMonth();
        let yearIndex: number = new Date().getFullYear();
        const month: number = monthIndex; // 1 for Jan, 2 for Feb
        const year: number = yearIndex; // 1 for Jan, 2 for Feb
        const monthNames: Array<string> = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        // Find the text layer called 'dateCreated' and replaces it with the month and year.
        const coverDate = coverInstance.findOne(
          (n) => n.name === "dateCreated" && n.type === "TEXT"
        );
        if (coverDate && coverDate.type === "TEXT") {
          coverDate.characters = monthNames[month] + " " + year;
        }

        // Change the background colour of the cover page, perfect for making a seamless cover image in Figma.
        // Colours must be converted to RGB format.

        figma.currentPage.backgrounds = [
          {
            type: "SOLID",
            color: {
              r: 1,
              g: 1,
              b: 1,
            },
          },
        ];

        // Set the page to zoom to fit the cover instance
        figma.viewport.scrollAndZoomIntoView([coverInstance]);

        console.log("%cCover inserted", "color:green");
      }

      // Insert Example component
      const pageExample = createdPages.filter((page) => page.name === "🤔 About")[0]; // Choose the page to insert component on
      figma.currentPage = pageExample; // Switch to that page

      if (exampleComponent) {
        const exampleInstance = exampleComponent.createInstance(); // Insert the example component

        exampleInstance.y = 500; // Move it down below the heading
        var exampleInstanceWidth = 3000; // Define a new width
        var exampleInstanceHeight = 2000; // Define a new height
        exampleInstance.resize(exampleInstanceWidth, exampleInstanceHeight); // Resize the component

        let newSelection = figma.currentPage.findChildren(
          (n) => n.type === "INSTANCE"
        );

        figma.currentPage.selection = newSelection;
        figma.viewport.scrollAndZoomIntoView(newSelection);
        figma.currentPage.selection = [];
      }

      // Go back to the Cover page
      figma.currentPage = coverPage;

      // Remove the initial 'Page 1' that isn't required any longer
      let initialPage = figma.root.children[0];
      initialPage.remove();

      figma.closePlugin("Design Toolkit template applied");
    });
  });
  showUI({
    width: 320,
    height: 320,
  });
}
