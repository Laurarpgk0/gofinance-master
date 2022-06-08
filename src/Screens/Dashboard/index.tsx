import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "styled-components";

import { HighlightCard } from "../../components/HighlightCard";
import {
    TransactionsCard,
    TransactionCardProps,
} from "../../components/TransactionsCard";

import {
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer,
    SubHeader,
    Loading,
} from "./styles";

export interface DataListProps extends TransactionCardProps {
    id: string;
}

interface HighLightProps {
    amount: string;
    lastTransaction: string;
}

interface HighlightData {
    entries: HighLightProps;
    expensives: HighLightProps;
    total: HighLightProps;
}

export function Dashboard() {
    const [data, setData] = useState<DataListProps[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>(
        {} as HighlightData
    );

    const theme = useTheme();

    function getLastTransactionDate(
        collection: DataListProps[],
        type: "positive" | "negative"
    ) {
        const lastTransaction = new Date(
            Math.max.apply(
                Math,
                transactions
                    .filter((transaction) => transaction.type === "positive")
                    .map((transaction) => new Date(transaction.date).getTime())
            )
        );

        return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
            "pt-BT",
            { month: "long" }
        )}`;
    }

    async function loadTransactions() {
        const dataKey = "@goFinances:transactions";
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionFormatted: DataListProps[] = transactions.map(
            (item: DataListProps) => {
                if (item.type === "positive") {
                    entriesTotal += Number(item.amount);
                } else {
                    expensiveTotal += Number(item.amount);
                }

                const amount = Number(item.amount).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                });

                const date = Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                }).format(new Date(item.date));

                return {
                    id: item.id,
                    name: item.name,
                    amount,
                    type: item.type,
                    category: item.category,
                    date,
                };
            }
        );

        setData(transactionFormatted);

        const lastTransactionEntries = getLastTransactionDate(
            transactions,
            "positive"
        );
        const lastTransactionExpensives = getLastTransactionDate(
            transactions,
            "positive"
        );
        const totalInterval = `01 a ${lastTransactionExpensives}`;

        const total = entriesTotal - expensiveTotal;

        setHighlightData({
            entries: {
                amount: entriesTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
                lastTransaction: `Última entrada dia 13 ${lastTransactionEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
                lastTransaction: `Última saída dia 13 ${lastTransactionExpensives}`,
            },

            total: {
                amount: total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                }),
                lastTransaction: totalInterval,
            },
        });
        setIsLoading(false);
    }
    useEffect(() => {
        loadTransactions();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadTransactions();
        }, [])
    );

    return (
        <Container>
            {isLoading ? (
                <Loading />
            ) : (
                <>
                    <Header>
                        <UserWrapper>
                            <UserInfo>
                                <User>
                                    <UserGreeting>Olá, </UserGreeting>
                                    <UserName>Laura</UserName>
                                </User>
                            </UserInfo>
                            <LogoutButton>
                                <Icon name={"power"} />
                            </LogoutButton>
                        </UserWrapper>
                    </Header>
                    <HighlightCards>
                        <HighlightCard
                            type={"up"}
                            title={"Entradas"}
                            amount={highlightData.entries.amount}
                            lastTransaction={
                                highlightData.entries.lastTransaction
                            }
                        />
                        <HighlightCard
                            type={"down"}
                            title={"Saídas"}
                            amount={highlightData.expensives.amount}
                            lastTransaction={
                                highlightData.expensives.lastTransaction
                            }
                        />
                        <HighlightCard
                            type={"total"}
                            title={"Total"}
                            amount={highlightData.total.amount}
                            lastTransaction={
                                highlightData.total.lastTransaction
                            }
                        />
                    </HighlightCards>
                    <Transactions>
                        <SubHeader>
                            <Title>Listagem</Title>
                        </SubHeader>

                        <TransactionList
                            data={data}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TransactionsCard data={item} />
                            )}
                        />
                    </Transactions>
                </>
            )}
        </Container>
    );
}
