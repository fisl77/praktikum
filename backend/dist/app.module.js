"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_entity_1 = require("./Event/event.entity");
const eventEnemy_entity_1 = require("./EventEnemy/eventEnemy.entity");
const enemy_entity_1 = require("./Enemy/enemy.entity");
const enemyName_entity_1 = require("./EnemyName/enemyName.entity");
const enemyType_entity_1 = require("./EnemyType/enemyType.entity");
const eventLevel_entity_1 = require("./EventLevel/eventLevel.entity");
const level_entity_1 = require("./Level/level.entity");
const questionnaire_entity_1 = require("./Questionnaire/questionnaire.entity");
const answer_entity_1 = require("./Answer/answer.entity");
const voting_entity_1 = require("./Voting/voting.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: './database/database',
                entities: [
                    event_entity_1.Event,
                    eventEnemy_entity_1.EventEnemy,
                    enemy_entity_1.Enemy,
                    enemyName_entity_1.EnemyName,
                    enemyType_entity_1.EnemyType,
                    eventLevel_entity_1.EventLevel,
                    level_entity_1.Level,
                    questionnaire_entity_1.Questionnaire,
                    answer_entity_1.Answer,
                    voting_entity_1.Voting,
                ],
                synchronize: true,
            }),
            typeorm_1.TypeOrmModule.forFeature([
                event_entity_1.Event,
                eventEnemy_entity_1.EventEnemy,
                enemy_entity_1.Enemy,
                enemyName_entity_1.EnemyName,
                enemyType_entity_1.EnemyType,
                eventLevel_entity_1.EventLevel,
                level_entity_1.Level,
                questionnaire_entity_1.Questionnaire,
                answer_entity_1.Answer,
                voting_entity_1.Voting,
            ]),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map