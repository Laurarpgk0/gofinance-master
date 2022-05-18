import React, { useState, useEffect } from "react";

import { Modal, TouchableWithoutFeedback, Keyboard, Alert } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { InputForm } from "../../components/Forms/InputForm";

import { useForm } from "react-hook-form";

import { Button } from "../../components/Forms/Button";

import { TransactionTypeButton } from "../../components/Forms/TransactionTypeButton";

import { CategorySelectButton } from "../../components/Forms/CategorySelectButton";

import { CategorySelect } from "../CategorySelect";

import uuid from "react-native-uuid";

import {
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionsTypes,
    Spacement,
} from "./styles";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface FormData {
    name: string;
    amount: string;
}

const schema = Yup.object().shape({
    name: Yup.string().required("Nome obrigatório"),
    amount: Yup.number()
        .typeError("Informe um valor númerico")
        .positive("O valor não pode ser negativo"),
});

export function Register() {
    const dataKey = "@gofinances:transactions";
    const [transactionType, setTransactionType] = useState("");
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const [category, setCategory] = useState({
        key: "category",
        name: "Categoria",
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
    });

    function handleTransationTypeSelect(type: "up" | "down") {
        setTransactionType(type);
    }

    function handleOpenSelectCategory() {
        setCategoryModalOpen(true);
    }
    function handleCloseSelectCategoryModal() {
        setCategoryModalOpen(false);
    }

    async function handleRegister(form: FormData) {
        if (!transactionType)
            return Alert.alert("Selecione o tipo de transação");

        if (category.key === "category")
            return Alert.alert("Selecione a categoria");

        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            amount: form.amount,
            transactionType,
            category: category.key,
            date: new Date(),
        };
        try {
            const data = await AsyncStorage.getItem(dataKey);

            const currentData = data ? JSON.parse(data) : [];

            const formattedData = [...currentData, newTransaction];

            await AsyncStorage.setItem(dataKey, JSON.stringify(formattedData));

            reset();
            setTransactionType("");
            setCategory({
                key: "category",
                name: "Categoria",
            });
        } catch (error) {
            console.log(error);
            Alert.alert("Não foi possivel salvar");
        }
    }

    useEffect(() => {
        async function loadData() {
            const data = await AsyncStorage.getItem(dataKey);
            console.log(JSON.parse(data!));
        }
        loadData();
    }, []);

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>
                <Header>
                    <Title>Cadastro</Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm
                            name="name"
                            control={control}
                            placeholder="Nome"
                            autoCapitalize="sentences"
                            autoCorrect={false}
                            error={errors.name && errors.name.message}
                        />

                        <InputForm
                            name="amount"
                            control={control}
                            placeholder="Preço"
                            keyboardType="numeric"
                            error={errors.amount && errors.amount.message}
                        />

                        <TransactionsTypes>
                            <TransactionTypeButton
                                type="up"
                                title="Income"
                                onPress={() => handleTransationTypeSelect("up")}
                                isActive={transactionType === "up"}
                            />
                            <TransactionTypeButton
                                type="down"
                                title="Outcome"
                                onPress={() =>
                                    handleTransationTypeSelect("down")
                                }
                                isActive={transactionType === "down"}
                            />
                        </TransactionsTypes>

                        <CategorySelectButton
                            title={category.name}
                            onPress={handleOpenSelectCategory}
                        />
                    </Fields>

                    <Spacement />
                    <Button
                        title="Enviar"
                        onPress={handleSubmit(handleRegister)}
                    />
                </Form>

                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory={setCategory}
                        closeSelectCategory={handleCloseSelectCategoryModal}
                    />
                </Modal>
            </Container>
        </TouchableWithoutFeedback>
    );
}
