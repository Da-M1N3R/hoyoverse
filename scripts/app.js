class CharacterGallery {
  constructor() {
    this.currentGame = "genshin";
    this.teams = { genshin: [], zzz: [] };
    this.setupEventListeners();
    this.loadRegions();
    this.loadCharacters();
    this.updateTeamDisplay();
  }

  setupEventListeners() {
    document
      .getElementById("genshin-toggle")
      .addEventListener("click", () => this.switchGame("genshin"));
    document
      .getElementById("zzz-toggle")
      .addEventListener("click", () => this.switchGame("zzz"));
    document
      .getElementById("region-select")
      .addEventListener("change", () => this.loadCharacters());
    document
      .getElementById("close-detail")
      .addEventListener("click", () => this.hideCharacterDetail());
    document
      .getElementById("team-btn")
      .addEventListener("click", () => this.toggleTeamMembership());
    document
      .getElementById("view-team-btn")
      .addEventListener("click", () => this.toggleTeamDisplay());
  }

  switchGame(game) {
    this.currentGame = game;
    this.loadRegions();
    this.loadCharacters();
    this.updateTeamDisplay();
  }

  async loadRegions() {
    const regionSelect = document.getElementById("region-select");
    const regions = await this.fetchRegions(this.currentGame);

    regionSelect.innerHTML =
      `<option value="ALL" selected>ALL</option>` +
      regions
        .map((region) => `<option value="${region}">${region}</option>`)
        .join("");
  }

  async loadCharacters() {
    const characterGrid = document.getElementById("character-grid");
    const selectedRegion = document.getElementById("region-select").value;
    const characters = await this.fetchCharacters(
      this.currentGame,
      selectedRegion
    );

    characterGrid.innerHTML = characters
      .map(
        (char) => `
                <div class="character-card" data-name="${char.name}" data-region="${char.region}" data-image="${char.imageUrl}">
                    <img src="${char.imageUrl}" alt="${char.name}">
                    <h3>${char.name}</h3>
                    <p>${char.region}</p>
                </div>
            `
      )
      .join("");

    // Add click listeners to cards
    document.querySelectorAll(".character-card").forEach((card) => {
      card.addEventListener("click", (e) =>
        this.showCharacterDetail(e.currentTarget)
      );
    });
  }

  async fetchRegions(game) {
    const data = await fetch(`data/${game}-characters.json`).then((r) =>
      r.json()
    );
    return [...new Set(data.map((char) => char.region))];
  }

  async fetchCharacters(game, region) {
    const data = await fetch(`data/${game}-characters.json`).then((r) =>
      r.json()
    );
    return region === "ALL"
      ? data
      : data.filter((char) => char.region === region);
  }

  showCharacterDetail(card) {
    const name = card.dataset.name;
    const region = card.dataset.region;
    const image = card.dataset.image;

    document.getElementById("detail-img").src = image;
    document.getElementById("detail-name").textContent = name;
    document.getElementById("detail-region").textContent = region;

    this.currentCharacter = { name, region, imageUrl: image };
    this.updateTeamButton();

    document.getElementById("character-detail").classList.remove("hidden");
  }

  hideCharacterDetail() {
    document.getElementById("character-detail").classList.add("hidden");
  }

  updateTeamButton() {
    const teamBtn = document.getElementById("team-btn");
    const isInTeam = this.teams[this.currentGame].some(
      (char) => char.name === this.currentCharacter.name
    );
    teamBtn.textContent = isInTeam ? "REMOVE FROM TEAM" : "ADD TO TEAM";
  }

  toggleTeamMembership() {
    const char = this.currentCharacter;
    const team = this.teams[this.currentGame];
    const existingIndex = team.findIndex((c) => c.name === char.name);

    if (existingIndex >= 0) {
      // Remove from team
      team.splice(existingIndex, 1);
    } else {
      // Add to team
      team.push(char);
    }

    this.updateTeamButton();
    this.updateTeamDisplay();
  }

  toggleTeamDisplay() {
    const teamDisplay = document.getElementById("team-display");
    const isHidden = teamDisplay.classList.contains("hidden");

    if (isHidden) {
      this.updateTeamDisplay();
      teamDisplay.classList.remove("hidden");
    } else {
      teamDisplay.classList.add("hidden");
    }
  }

  updateTeamDisplay() {
    const teamMembers = document.getElementById("team-members");
    const team = this.teams[this.currentGame];

    if (team.length === 0) {
      teamMembers.innerHTML = "<p>No characters in your team yet.</p>";
    } else {
      teamMembers.innerHTML = team
        .map(
          (char) => `
            <div class="team-member">
              <img src="${char.imageUrl}" alt="${char.name}">
              <h4>${char.name}</h4>
              <p>${char.region}</p>
            </div>
          `
        )
        .join("");
    }
  }
}

document.addEventListener("DOMContentLoaded", () => new CharacterGallery());
