"use client"

import {useTranslations} from 'next-intl';
const DashboardPage = () => {

    const t = useTranslations('HomePage');
    return (
        <div className="section">

            <h1>
                Dashboard
            </h1>

        </div>
    );
};

export default DashboardPage;
