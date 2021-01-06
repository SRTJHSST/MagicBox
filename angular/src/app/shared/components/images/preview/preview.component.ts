import { Component, OnInit, Renderer2, Inject } from "@angular/core";
import {DOCUMENT} from '@angular/common';
import {
  PreviewFileService,
  ElectronService,
  OptimizationService,
} from "../../../../core/services";
import { AppFile, FileOptions, FileStatus } from "../../../../data";
import { ContextMenuService } from "../../../../core/services";
import {
  getPreviewURI,
  getEncodedSvgCSSBackground,
} from "../../../../shared/utilities";
import { DropdownService } from "../../dropdown/dropdown.service";

import { ViewTransition } from "../../../animations";
import { FooterAnimation } from "../images.animations";

const TabItems = {
  Preview: {
    id: 0,
    label: "Preview",
  },
  Code: {
    id: 1,
    label: "Code",
  },
  Attachments: {
    id: 3,
    label: "Attachments",
  },
};

@Component({
  selector: "app-preview",
  templateUrl: "./preview.component.html",
  styleUrls: ["../../table/table.component.scss", "./preview.component.scss"],
  animations: [ViewTransition, FooterAnimation],
})
export class PreviewComponent implements OnInit {
  public file: AppFile;
  public currentState: FileOptions = FileOptions.Shrinked;
  public tabs = [TabItems.Preview];
  public activeTabId = 0;
  // Editor
  public codeEditorOptions = {
    lineNumbers: true,
    theme: "duotone-light",
    mode: "xml",
    lineWrapping: true,
  };
  // SVG
  public svgCode = {
    original: "",
    shrinked: "",
  };
  // Sketch
  public sketchAttachments = {
    root: [],
    images: [],
    pages: [],
  };
  // Dropdown
  public dropdownIsClosed = false;

  constructor(
    private previewFileService: PreviewFileService,
    private electronService: ElectronService,
    private dropdownService: DropdownService,
    private optimizationService: OptimizationService,
    private contextMenuService: ContextMenuService,
    private renderer2: Renderer2,
    @Inject(DOCUMENT) private _document
  ) { }

  ngOnInit() {
    this.previewFileService.file.subscribe((file: AppFile) => {
      this.file = file;
      // If file doesn't have optimised option
      if (
        file.status === FileStatus.new ||
        file.status === FileStatus.needsUpdate
      ) {
        this.currentState = FileOptions.Original;
      }
      switch (file.original.type) {
        case "image/svg+xml":
          console.log(file)
          this.tabs = [TabItems.Preview, TabItems.Code];
          // Get SVG code
          if (
            file.hasSourceFile ||
            file.status === FileStatus.new ||
            file.status === FileStatus.needsUpdate
          ) {
            if (file.original.data) {
              this.svgCode.original = file.original.data;
            } else {
              this.electronService.fs.readFile(
                file.original.path,
                { encoding: "utf-8" },
                (e, data) => {
                  this.svgCode.original = data;
                }
              );
            }
          }
          if (file.status === FileStatus.optimized) {
            if (file.shrinked.data) {
              this.svgCode.shrinked = file.shrinked.data;
            } else {
              this.electronService.fs.readFile(
                file.shrinked.path,
                { encoding: "utf-8" },
                (e, data) => {
                  this.svgCode.shrinked = data;
                }
              );
            }
          }
          break;
        default:
          this.tabs = [TabItems.Preview];
          break;
      }

      this.dropdownService.setList(this.file);
    });
  }

  public getPreviewURI(path: string): string {
    return getPreviewURI(path);
  }

  public getEncodedSvgCSSBackground(data: string): string {
    return getEncodedSvgCSSBackground(data);
  }

  public isFileOptimized(): boolean {
    return this.file.status === FileStatus.optimized;
  }

  public goBack(): void {
    this.previewFileService.componentViewStatus(false);
  }

  public switchFileSource(): void {
    this.currentState =
      this.currentState === FileOptions.Original
        ? FileOptions.Shrinked
        : FileOptions.Original;
  }

  public setActiveTabId(id: number): void {
    this.activeTabId = id;
  }

  public trackByFn = (index: number) => index;

  public optimizeFile(): void {
    this.optimizationService.fileOptimization(this.file).then(() => {
      this.currentState = FileOptions.Shrinked;
    });
  }

  public stopProcess(): void {
    this.optimizationService.stopProcess();
  }

  public onRightClick(file: AppFile): void {
    this.contextMenuService.showOnFile(file);
  }
}

/*
  1) Добавить Stop()
  2) Loading Process
  3) SKETCH Support
    - Grid/Table view список файлов
    - распаковка файла при открытии???
*/
