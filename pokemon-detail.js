let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMONS = 649;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try { 
      const [pokemon, pokemonSpecies] = await Promise.all([fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => 
        res.json()
         ),
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => 
            res.json()
         ),
        ]);   
    
      const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
      abilitiesWrapper.innerHTML = "";

      if (currentPokemonId === id) {
        displayPokemonDetails(pokemon);
            const flavorText = getEnglishFlavorText(pokemonSpecies);
            document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;

        const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) => document.querySelector(sel)
       );
        leftArrow.removeEventListener("click", navigatePokemon);
        rightArrow.removeEventListener("click", navigatePokemon);
        
        if (id !== 1) {
            leftArrow.addEventListener("click", () => {
                navigatePokemon(id - 1);
            });
        }
        if (id !== 649) {
            rightArrow.addEventListener("click", () => {
                navigatePokemon(id + 1);
            });
        }

        window.history.pushState({}, "", `./detail.html?id=${id}`);
      }
    
      return true
    } catch (error) {
      console.error("An error occured while fetching Pokemon data:", error);
      return false;
    }
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
};

function setElementStyles(elements, cssProperty, value) {
    elements.forEach((element) => {
        element.style[cssProperty] = value;
    });
}

function rgbaFromHex(hexColor) {
    return [
        parseInt(hexColor.slice(1,3), 16),
        parseInt(hexColor.slice(3,5), 16),
        parseInt(hexColor.slice(5,7), 16),
    ].join(", ");
}

function setTypeBackgroundColor(pokemon) {
    const mainType = pokemon.types[0].type.name;
    const mainColor = typeColors[mainType];
    
    
    

    if (!mainColor) {
        console.warn(`Color not defined for types: ${mainType}`);
        return;
    }

    const typeElements = document.querySelectorAll(".power-wrapper > p");
    setElementStyles([typeElements[0]], "backgroundColor", mainColor);

    if (pokemon.types.length > 1) {
        const secondaryType = pokemon.types[1].type.name;
        const secondaryColor = typeColors[secondaryType];

        // Ensure the secondary type color is defined
        if (!secondaryColor) {
            console.warn(`Color not defined for type: ${secondaryType}`);
        } else {
            setElementStyles([typeElements[1]], "backgroundColor", secondaryColor);
        }
    }



    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement],"backgroundColor", mainColor);
    setElementStyles([detailMainElement],"borderColor", mainColor);

    
    setElementStyles(document.querySelectorAll(".stats-wrap p.stats"), "color", mainColor);
    

    const rgbaColor = rgbaFromHex(mainColor);
    const styleTag = document.createElement("style");
    styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0);
}
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${mainColor};
    }
    `;
    document.head.appendChild(styleTag);

}


function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
function createAndAppendElement(parent, tag, options = {}){
    const element = document.createElement(tag);
    Object.keys(options).forEach((key) => {
        element [key] = options [key];
    });
    parent.appendChild(element);
    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities,stats} = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);
    document.querySelector("title").textContent = capitalizePokemonName;

    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

        document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;

        document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

        const imageElement = document.querySelector(".detail-img-wrapper img");
        imageElement.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
        imageElement.alt = name;

        const typeWrapper = document.querySelector(".power-wrapper");
        typeWrapper.innerHTML = "";
            types.forEach(({ type }) => {
                createAndAppendElement(typeWrapper, "p", {
                    className: `body3-fonts type ${type.name}`, 
                    textContent: type.name,
                });
                });
           

            document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10} kg`;
            document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10} m`;

            const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
            abilities.forEach(({ ability }) => {
                createAndAppendElement(abilitiesWrapper, "p", {
                    className: "body3-fonts",
                    textContent: ability.name,
                });
            });
            
            const statsWrapper = document.querySelector(".stats-wrapper");
            statsWrapper.innerHTML = "";

            const statNameMapping = {
                hp: "HP",
                attack: "ATK",
                defense: "DEF",
                "special-attack": "SP.ATK",
                "special-defense": "SP.DEF",
                speed: "SPD",
            };

            stats.forEach(({stat, base_stat}) => {
                const statDiv = document.createElement("div");
                statDiv.className = "stats-wrap";
                statsWrapper.appendChild(statDiv);

                createAndAppendElement(statDiv, "p",{
                    className: "body3-fonts stats", 
                    textContent: statNameMapping[stat.name],
                });
                const formattedStat = base_stat < 100 ? String(base_stat).padStart(1, "0") : String(base_stat);
                createAndAppendElement(statDiv, "p",{
                    className: "body3-fonts",
                    textContent: formattedStat,
                });
                const progressBar = createAndAppendElement(statDiv, "progress",{
                    className: "progress-bar",
                    value: base_stat,
                    max: 160, 
                });
                const dynamicWidth = Math.max(20, (base_stat / 160) * 100);
                progressBar.style.width = `${dynamicWidth}px`;
            });

            setTypeBackgroundColor(pokemon);
}
function getEnglishFlavorText(pokemonSpecies) {
    for (let entry of pokemonSpecies.flavor_text_entries)
    {
        if (entry.language.name === "en") {
            let flavor = entry.flavor_text.replace(/\f/g, "");

            flavor = flavor.replace(/\bPOKéMON\b/gi, "Pokémon");
            
            
            return flavor;
        }
    }
    return "";
}
