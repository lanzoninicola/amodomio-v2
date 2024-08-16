import { Outlet } from "@remix-run/react";
import Container from "~/components/layout/container/container";
import PageHeader from "~/components/layout/page/page-header/page-header";

export default function ProductsOutlet() {
    return (
        <Container className="mt-12">
            <PageHeader
                title="Produtos"
                goBackLink="/admin/products"
                newItemBtnLabel="Novo Produto"
            />
            <Outlet />
        </Container>
    )
}

