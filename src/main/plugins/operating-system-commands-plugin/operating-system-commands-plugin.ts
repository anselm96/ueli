import { SearchPlugin } from "../../search-plugin";
import { SearchResultItem } from "../../../common/search-result-item";
import { PluginType } from "../../plugin-type";
import { AutoCompletionResult } from "../../../common/auto-completion-result";
import { UserConfigOptions } from "../../../common/config/user-config-options";
import { TranslationSet } from "../../../common/translation/translation-set";
import { OperatingSystemCommandsOptions } from "../../../common/config/operating-system-commands-options";
import { exec } from "child_process";
import { OperatingSystemCommandRepository } from "./operating-system-commands-repository";

export class OperatingSystemCommandsPlugin implements SearchPlugin {
    public pluginType = PluginType.OperatingSystemCommandsPlugin;
    public openLocationSupported = false;
    public autoCompletionSupported = false;
    private config: OperatingSystemCommandsOptions;
    private readonly operatingSystemCommandRepository: OperatingSystemCommandRepository;

    constructor(config: OperatingSystemCommandsOptions, operatingSystemCommandRepository: OperatingSystemCommandRepository) {
        this.config = config;
        this.operatingSystemCommandRepository = operatingSystemCommandRepository;
    }

    public getAll(): Promise<SearchResultItem[]> {
        return new Promise((resolve, reject) => {
            this.operatingSystemCommandRepository.getAll()
                .then((commands) => {
                    if (commands.length === 0) {
                        resolve([]);
                    } else {
                        const result = commands.map((command): SearchResultItem => {
                            return {
                                description: command.description,
                                executionArgument: command.executionArgument,
                                hideMainWindowAfterExecution: true,
                                icon: command.icon,
                                name: command.name,
                                originPluginType: this.pluginType,
                                searchable: command.searchable,
                            };
                        });
                        resolve(result);
                    }
                })
                .catch((err) => reject(err));
        });
    }

    public refreshIndex(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public clearCache(): Promise<void> {
        return new Promise((resolve) => {
            resolve();
        });
    }

    public isEnabled(): boolean {
        return this.config.isEnabled;
    }

    public execute(searchResultItem: SearchResultItem, privileged: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(searchResultItem.executionArgument, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public openLocation(searchResultItem: SearchResultItem): Promise<void> {
        return new Promise((resolve, reject) => {
            reject("openLocation is not supported in operating system commands plugin");
        });
    }

    public autoComplete(searchResultItem: SearchResultItem): Promise<AutoCompletionResult> {
        return new Promise((resolve, reject) => {
            reject("autoComplete is not supported in operating system commands plugin");
        });
    }

    public updateConfig(updatedConfig: UserConfigOptions, translationSet: TranslationSet): Promise<void> {
        return new Promise((resolve, reject) => {
            this.config = updatedConfig.operatingSystemCommandsOptions;
            this.operatingSystemCommandRepository.updateConfig(updatedConfig, translationSet)
                .then(() => resolve())
                .catch((err) => reject(err));
        });
    }
}