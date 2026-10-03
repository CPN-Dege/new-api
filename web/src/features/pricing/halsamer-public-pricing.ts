/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { FOCUSED_MODELS } from '../home/public-branding'

export const HALSAMER_PUBLIC_MODELS = FOCUSED_MODELS.map(
  (model) => model.modelId
)

export function isHalsamerPublicModel(modelName: string): boolean {
  return HALSAMER_PUBLIC_MODELS.some((id) => id === modelName)
}

export function selectHalsamerPublicModels<
  T extends { model_name: string; enable_groups: string[] },
>(models: T[]): T[] {
  return models
    .filter(
      (model) =>
        isHalsamerPublicModel(model.model_name) &&
        model.enable_groups.includes('default')
    )
    .map((model) => ({ ...model, enable_groups: ['default'] }))
}
