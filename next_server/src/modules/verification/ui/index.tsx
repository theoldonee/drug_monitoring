"use client";

import { createClient } from "@/lib/supabase/client";
import { useCategoryStore } from "@/stores/useCategoryStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useEffect, useState } from "react";

const ticketSeverity = ["High", "Medium", "Low"];
const tabCategories = ["Unverified", "Verified"];

export function TicketTab(){

    const {severity, setSeverity} = useCategoryStore();
    useEffect(() => {
        setSeverity(ticketSeverity[0]);
    }, []);
    

    return (
        <div className="w-full h-full">
            <Tabs value={severity} onValueChange={setSeverity} className="w-full h-full">
                <TabsList className="w-fit h-fit">
                    {ticketSeverity.map((tabCategory) => 
                        (
                            <TabsTrigger key={tabCategory} value={tabCategory}>{tabCategory}</TabsTrigger>
                        ))
                    }
               
                </TabsList>
                
                {
                    ticketSeverity.map((categories) => (
                        <TabsContent key={categories} value={categories} className="flex justify-center">
                            <TabCategory />
                        </TabsContent>
                    ))
                }
            </Tabs>
        </div>
    );
}

function TabCategory(){

    const {category, severity,  setCategory} = useCategoryStore();
    
    useEffect(() => {
        setCategory(tabCategories[0]);
    }, []);
    
    const [data, setData] =  useState<Array<{ id: any; category?: string }>>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!severity || !category) {
                console.log("Skipping fetch - missing state:", { severity, category });
                return;
            }
            
            const supabase = await createClient();
            const { data: reports, error } = await supabase
                .from("reports")
                .select("id")
                .eq("severity", severity)
                .eq("category", category);
            
            console.log("Query params:", { severity, category });
            console.log("Reports data:", reports);
            console.log("Query error:", error);
            
            setData(reports || []);
        };

        fetchData();
    }, [category, severity]);

    return(
        <Tabs value={category} onValueChange={setCategory} className="w-full h-full">
            <TabsList>
                {tabCategories.map((tabCategory) => 
                    (
                        <TabsTrigger key={tabCategory} value={tabCategory}>{tabCategory}</TabsTrigger>
                    ))
                }
            </TabsList>

            {
                tabCategories.map((tabCategory) => (
                    <TabsContent key={tabCategory} value={tabCategory}>
                        <Card>
                            <CardHeader>
                                <CardDescription>
                                    {
                                        (tabCategory == "Unverified")? "Unverified reports" : "Verified reports"
                                    }
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="text-sm text-muted-foreground">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <Card key={item.id}>
                                            <CardContent className="text-sm text-muted-foreground">
                                                <div>
                                                    Ticket ID: {item.id}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div>No reports found</div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))
            }
        </Tabs>
    );
}