import { Recipe } from "@prisma/client";
import { Form } from "@remix-run/react";
import InputItem from "~/components/primitives/form/input-item/input-item";
import SaveItemButton from "~/components/primitives/table-list/action-buttons/save-item-button/save-item-button";
import Fieldset from "~/components/ui/fieldset";
import { Textarea } from "~/components/ui/textarea";
import SelectRecipeType from "../select-recipe-type/select-recipe-type";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";

interface RecipeFormProps {
    recipe?: Recipe;
    actionName: "recipe-create" | "recipe-update";
}

export default function RecipeForm({ recipe, actionName }: RecipeFormProps) {
    return (
        <Form method="post">
            <input type="hidden" name="recipeId" value={recipe?.id} />
            <div className="mb-8">
                <div className="flex flex-row mb-4 justify-end" >
                    <SaveItemButton actionName={actionName} label="Salvar" labelClassName="uppercase font-semibold tracking-wider text-xs" variant={"outline"} />
                </div>
                <div className="md:grid md:grid-cols-2 md:items-start flex flex-col gap-8 border rounded-md p-4 ">
                    <div className="flex flex-col">

                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="name">Nome</Label>
                            <InputItem id="name" name="name" defaultValue={recipe?.name} className="col-span-2" required />
                        </Fieldset>
                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="type">Tipo</Label>
                            <SelectRecipeType defaultValue={recipe?.type} className="col-span-2" />
                        </Fieldset>
                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea id="description" name="description" defaultValue={recipe?.description || ""} className="col-span-2" />
                        </Fieldset>
                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="hasVariations">Variações</Label>
                            <Switch id="hasVariations" name="hasVariations" defaultChecked={recipe?.hasVariations} />
                        </Fieldset>

                    </div>
                    <div className="flex flex-col">
                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="isVegetarian">Vegetariana</Label>
                            <Switch id="isVegetarian" name="isVegetarian" defaultChecked={recipe?.isVegetarian} />
                        </Fieldset>
                        <Fieldset className="grid-cols-3">
                            <Label htmlFor="isGlutenFree">Sem glútem</Label>
                            <Switch id="isGlutenFree" name="isGlutenFree" defaultChecked={recipe?.isGlutenFree} />
                        </Fieldset>
                    </div>
                </div>
            </div>

        </Form>
    )
}