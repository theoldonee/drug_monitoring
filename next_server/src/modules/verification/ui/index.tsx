"use client";

import { redirect } from 'next/navigation'
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
const tabCategories = ["Pending Review", "Reviewed"];

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
    
    const [data, setData] =  useState<Array<{ report_id: any;  }>>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!severity || !category) {
                console.log("Skipping fetch - missing state:", { severity, category });
                return;
            }
            
            const supabase = await createClient();
            const { data: reports, error } = await supabase
                .from("ai_responses")
                .select("report_id, reports!inner(status)")
                .eq("urgency_level", severity.toLowerCase())
                .eq("reports.status", category.replace(" ", "_").toUpperCase());
            
            console.log("Query params:", { severity, category });
            console.log("Reports data:", reports);
            console.log("Query error:", error);
            
            setData(reports || []);
        };

        fetchData();
    }, [category, severity]);

    function OpenTicket(ticketId: number){
        redirect(`/review/${ticketId}`);
    }

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
                                        (tabCategory == "Pending Review")? "Unverified reports" : "Verified reports"
                                    }
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="text-sm text-muted-foreground flex flex-col gap-4">
                                {data.length > 0 ? (
                                    data.map((item) => (
                                        <Card key={item.report_id} className="cursor-pointer hover:scale-[1.01]" onClick={() => { OpenTicket(item.report_id)}}>
                                            <CardContent className="text-sm text-muted-foreground">
                                                <div>
                                                    Ticket ID: {item.report_id}
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