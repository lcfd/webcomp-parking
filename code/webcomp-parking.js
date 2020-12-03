import "@babel/polyfill";
import leafletStyle from "leaflet/dist/leaflet.css";
import { css, html, LitElement, unsafeCSS } from "lit-element";
import { requestGetCoordinatesFromSearch } from "./api/hereMaps";
import { render_details } from "./components/details";
import { render__mapControls } from "./components/mapControls";
import { render_searchPlaces } from "./components/searchPlaces";

import {
  drawStationsOnMap,
  drawUserOnMap,
  initializeMap,
} from "./mainClassMethods/map";
import { observedProperties } from "./observedProperties";
import "./shared_components/button/button";
import "./shared_components/dropdown/dropdown";
import "./shared_components/languagePicker/languagePicker";
// Shared components
import "./shared_components/searchBar/searchBar";
import "./shared_components/sideModalHeader/sideModalHeader";
import "./shared_components/sideModalRow/sideModalRow";
import "./shared_components/sideModalTabs/sideModalTabs";
import "./shared_components/tag/tag";
import { debounce, isMobile, LANGUAGES } from "./utils";
import ParkingStyle from "./webcomp-parking.scss";

class Parking extends LitElement {
  constructor() {
    super();
    this.height = "500px";
    this.width = "100%";
    this.fontFamily = "";
    this.mapAttribution = "";
    this.language = LANGUAGES.EN;

    this.isLoading = true;

    this.map = undefined;
    this.currentLocation = { lat: 46.479, lng: 11.331 };

    this.hereMapsPlacesFound = [];
    this.hereMapsQuery = "";

    this.currentStation = {};
    this.detailsOpen = false;

    this.filters = {
      radius: 0,
    };
  }

  static get properties() {
    return observedProperties;
  }

  static get styles() {
    return css`
      /* Map */
      ${unsafeCSS(leafletStyle)}
      ${unsafeCSS(ParkingStyle)}
    `;
  }

  async drawMap() {
    drawUserOnMap.bind(this)();
  }

  async firstUpdated() {
    initializeMap.bind(this)();
    drawUserOnMap.bind(this)();
    await drawStationsOnMap.bind(this)();

    this.isLoading = false;
  }

  handleChangeTab(id) {
    this.currentTab = id;
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === "currentTab") {
        if (oldValue === 1) {
          this.map.off();
          this.map.remove();
        }
        // if (this.currentTab === 1 && oldValue !== undefined) {
        this.isLoading = true;
        initializeMap
          .bind(this)()
          .then(() => {
            console.log(drawUserOnMap);
            drawUserOnMap.bind(this)();
            drawStationsOnMap
              .bind(this)()
              .then(() => {
                this.isLoading = false;
              });
          });
        // }
      }
    });
  }

  handleSearch = (searchValue) => {
    console.log(searchValue);
  };

  handleSearchBarFilterAction = () => {
    console.log("Toggle filters");
    this.showFilters = !this.showFilters;
  };

  debounced__request__get_coordinates_from_search = debounce(
    500,
    requestGetCoordinatesFromSearch.bind(this)
  );

  render() {
    return html`
      <style>
        * {
          --width: ${this.width};
          --height: ${this.height};
          --w-c-font-family: ${this.fontFamily};
        }
      </style>
      ${this.isLoading ? html`<div class="globalOverlay"></div>` : ""}
      ${this.tiles_url
        ? ""
        : html`
            <p style="color:red">Required attribute \`tiles_url\` is missing</p>
          `}

      <div
        class="parking 
          ${
          /*this.mobile_open ? `MODE__mobile__open` : `MODE__mobile__closed`*/ ""
        }
          ${isMobile() ? `mobile` : ``}
          ${/*this.getAnimationState()*/ ""}"
      >
        <div
          class="parking__language_picker ${this.currentTab === 1
            ? "big_margin"
            : ""}"
        >
          <wc-languagepicker
            .supportedLanguages="${LANGUAGES}"
            .language="${this.language}"
            .changeLanguageAction="${(language) => {
              this.language = language;
            }}"
          ></wc-languagepicker>
        </div>
        ${/*this.isFullScreen ? this.render_closeFullscreenButton() : null*/ ""}
        ${/*this.render_backgroundMap()*/ ""}

        <div class="parking__sideBar">
          <!-- <div class="parking__sideBar__tabBar">
          </div> -->

          <div class="parking__sideBar__searchBar mt-4px">
            ${render_searchPlaces.bind(this)()}
          </div>

          ${this.detailsOpen
            ? html`<div class="parking__sideBar__details mt-4px">
                ${render_details.bind(this)()}
              </div>`
            : ""}
        </div>

        <div id="map"></div>
        ${render__mapControls.bind(this)()}
      </div>
    `;
  }
}

customElements.get("webcomp-parking") ||
  customElements.define("webcomp-parking", Parking);
