import { Component, OnInit, OnDestroy } from "@angular/core";
import { ElectronService, ThemeService, Themes } from "../../core/services";
import { ViewTransition } from "../../shared/animations";

interface ISetting {
  id: string;
  name: string;
  status?: boolean;
}

interface IImages {
  jpeg: {
    quality: string;
  };
  webp: {
    quality: string;
    alpha: string;
  };
  tiff: {
    quality: string;
  };
  svg: {
    precision: string;
  };
}

enum ESettings {
  notification = "Enable notifications",
  suffix = "Add .min suffix to shrinked file",
  // updateCheck = "Auto-updates",
  clipboardWatcher = "Clipboard SVG watcher",
  // defaultGridView = "Files preview as Grid",
  // fileWatcher = "Track files changes",
}

@Component({
  selector: "app-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
  animations: [ViewTransition],
})
export class SettingsComponent implements OnInit, OnDestroy {
  settings: ISetting[];
  // Images quality
  images;
  // Appearance
  appearance;
  themes = Themes;
  // Update
  updateStatus: string;
  appVersion: string;

  constructor(
    private electronService: ElectronService,
    private themeService: ThemeService
  ) { }

  ngOnInit() {
    this.settings = [];
    const appSettings = this.electronService.settings.getSync("app");
    Object.keys(ESettings).forEach((item) => {
      this.settings.push({
        id: item,
        name: ESettings[item],
        status: appSettings[item],
      });
    });
    this.images = this.electronService.settings.getSync("images");
    this.appearance = this.electronService.settings.getSync("appearance");
    this.appVersion = this.electronService.remote.app.getVersion();

    this.electronService.ipcRenderer.on("update-status", (e, message) => {
      this.updateStatus = message;
      console.log(`Auto Updater Status: \n ${message}`);
    });
  }

  ngOnDestroy() {
    this.electronService.settings.setSync("images", this.images);
  }

  public checkOwnProperty(setting: ISetting): boolean {
    return setting.hasOwnProperty("status");
  }

  private saveSettings(): void {
    const _settings = {};
    this.settings.forEach((item) => {
      _settings[item.id] = item.status;
    });
    this.electronService.settings.setSync("app", _settings);
  }

  public onThemeChange(e: "Dark" | "Light"): void {
    const theme = e === "Dark" ? Themes.Dark : Themes.Light;
    this.appearance.theme = theme;
    this.themeService.switchTheme(theme);
    this.electronService.settings.setSync("appearance.theme", theme);
  }

  public setNavigationBarStyle(): void {
    this.appearance.smallNav = !this.appearance.smallNav;
    this.electronService.settings.setSync("appearance", this.appearance);
  }

  public setUserSettings(setting: ISetting): void {
    if (setting.hasOwnProperty("status")) {
      setting.status = !setting.status;
      this.saveSettings();
    }
  }
}
