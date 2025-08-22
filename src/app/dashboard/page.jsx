"use client"

import {useTranslations} from 'next-intl';
const DashboardPage = () => {

    const t = useTranslations('HomePage');
    return (
        <div className="flex flex-col gap-8 items-center justify-center h-screen">

            <h1 className="text-3xl font-bold">
                Dashboard
            </h1>

        </div>
    );
};

export default DashboardPage;
