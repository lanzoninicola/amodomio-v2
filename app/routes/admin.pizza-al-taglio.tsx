import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, Link, useActionData, useLoaderData } from "@remix-run/react";
import { Beef, LeafyGreen, MinusSquareIcon, Pizza, PlusSquareIcon } from "lucide-react";
import { useState } from "react";
import Container from "~/components/layout/container/container";
import TextareaItem from "~/components/primitives/form/textarea-item/textarea-item";
import { DeleteItemButton } from "~/components/primitives/table-list";
import SaveItemButton from "~/components/primitives/table-list/action-buttons/save-item-button/save-item-button";
import { Separator } from "~/components/ui/separator";
import { toast } from "~/components/ui/use-toast";
import SelectPizzaAlTaglioCategory from "~/domain/cardapio-pizza-al-taglio/components/select-pizza-al-taglio-type/select-pizza-al-taglio-type";
import FormAddPizzaSlice from "~/domain/pizza-al-taglio/components/form-pizza-al-taglio/form-pizza-al-taglio";
import { pizzaSliceEntity } from "~/domain/pizza-al-taglio/pizza-al-taglio.entity.server";
import { PizzaSlice, PizzaSliceCategory } from "~/domain/pizza-al-taglio/pizza-al-taglio.model.server";
import { cn } from "~/lib/utils";
import formatDate from "~/utils/format-date";
import { ok, serverError } from "~/utils/http-response.server";

import tryit from "~/utils/try-it";


export const loader: LoaderFunction = async () => {
    const [err, records] = await tryit(pizzaSliceEntity.findAllSlices({
        order: "desc",
        orderBy: "createdAt"
    }))

    return ok({ records });

};

export const action: ActionFunction = async ({ request }) => {
    let formData = await request.formData();
    const { _action } = Object.fromEntries(formData);

    const id = formData.get('id') as string;
    const toppings = formData.get('toppings') as string;
    const category = formData.get('category') as PizzaSliceCategory;


    if (_action === "add-pizza-al-taglio") {

        const newRecord: PizzaSlice = {
            toppings,
            category
        }

        const [err, record] = await tryit(pizzaSliceEntity.create(newRecord))

        if (err) {
            return serverError(err)
        }
    }

    if (_action === "record-update") {

        const [err, record] = await tryit(pizzaSliceEntity.findById(id as string))

        if (err) {
            return serverError(err)
        }

        const [errUpdate, recordUpdate] = await tryit(pizzaSliceEntity.update(id as string, {
            ...record,
            toppings,
            category
        }))

        if (errUpdate) {
            return serverError("Erro ao salvar os dados da pizza. Por favor contate o (46) 99127-2525")
        }

        return ok("Ingredientes atualizados com sucesso")
    }

    if (_action === "record-delete") {
        const [err, record] = await tryit(pizzaSliceEntity.delete(id as string))

        if (err) {
            return serverError(err)
        }

        return ok("Record apagado")
    }

    return null;
};

export default function PizzaSlicesAdmin() {

    const loaderData = useLoaderData<typeof loader>()

    const records: PizzaSlice[] = loaderData.payload?.records || []

    const [showForm, setShowForm] = useState(false)
    const [showFormUpdate, setShowFormUpdate] = useState(false)

    const actionData = useActionData<typeof action>()
    const status = actionData?.status
    const message = actionData?.message

    if (status && status === 200) {
        toast({
            title: "OK",
            description: message,
        })
    }

    if (status && status >= 400) {
        toast({
            title: "Erro",
            description: message,
        })
    }


    return (
        <Container className="mt-16">

            <div className="flex flex-col ">
                <div className="flex gap-4 items-center mb-4 justify-between">
                    <div className="flex items-center gap-2 cursor-pointer hover:font-semibold" onClick={() => setShowForm(!showForm)}>
                        <span className="text-sm underline">{
                            showForm === false ? "Adicionar pizza" : "Fechar formulário"
                        }</span>
                        {showForm === false ? <PlusSquareIcon /> : <MinusSquareIcon />}
                    </div>
                    <Link to="/admin/cardapio-pizza-al-taglio" className="py-2 px-4 rounded-md bg-black">
                        <span className=" text-white font-semibold">
                            Novo cardapio al taglio
                        </span>
                    </Link>
                </div>

                {
                    showForm && (
                        <FormAddPizzaSlice />
                    )
                }

            </div>


            <Separator className="mb-8" />

            <div className="flex flex-col">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-6">{`Listas das pizzas (${records.length})`}</h2>
                    <span className="text-sm underline cursor-pointer" onClick={() => setShowFormUpdate(!showFormUpdate)}>Abilitar alteraçoes</span>
                </div>
                <ul className="grid grid-cols-3 gap-4 ">
                    {
                        records.map((r: PizzaSlice) => {
                            return (
                                <li key={r.id} className={
                                    cn(
                                        "p-4 rounded-md border hover:bg-slate-50",
                                    )
                                }>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex flex-col">

                                                {/* <!-- Nome e ingredientes --> */}
                                                <div className="flex flex-col gap-6">

                                                    <Form method="post">
                                                        <input type="hidden" name="id" value={r.id} />
                                                        <div className="flex flex-col gap-6">
                                                            <div className="flex justify-between">
                                                                <div className="flex flex-col gap-4">
                                                                    <div className="flex flex-col gap-2">
                                                                        <TextareaItem
                                                                            type="text" name="toppings" defaultValue={r.toppings}
                                                                            className="border-none outline-none w-full text-md"
                                                                            rows={4}

                                                                        />
                                                                        {/* @ts-ignore */}
                                                                        <span className="text-sm text-muted-foreground">Criado em: {formatDate(r.createdAt)}</span>
                                                                    </div>
                                                                    <SelectPizzaAlTaglioCategory name={"category"} className="border-none outline-none w-full" />
                                                                </div>
                                                                {r.category === "vegetariana" && <LeafyGreen />}
                                                                {r.category === "carne" && <Beef />}
                                                                {r.category === "margherita" && <Pizza />}
                                                            </div>
                                                            {showFormUpdate && (

                                                                <div className="flex gap-2">
                                                                    <SaveItemButton actionName="record-update" />
                                                                    <DeleteItemButton actionName="record-delete" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </Form>


                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </li>


                            )
                        })
                    }
                </ul>
            </div>
        </Container>
    )

}

