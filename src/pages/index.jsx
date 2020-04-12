import React from 'react';
import Paypal from '../scripts/paypal';

import {
    MainTitle,
    SubTitle
} from '../els/Typography';
import {
    BulletList
} from '../els/Lists';
import {
    TextButton,
    MainButton
} from '../els/Buttons';

export default function IndexPage() {
    return (
        <main>
            <section className="about">
                <MainTitle>Ice productions</MainTitle>
                <p>We are independent team working on tools to help developers all over the world.</p>
                <SubTitle>Our creations</SubTitle>
                <BulletList container>
                    <BulletList item><TextButton element="a" href="https://github.com/iceproductions/website">This website</TextButton></BulletList>
                    <BulletList item><TextButton element="a" href="https://github.com/iceproductions/discord-bot">Discord bot</TextButton></BulletList>
                    <BulletList item><TextButton element="a" href="https://github.com/iceproductions/browser">Browser</TextButton></BulletList>
                    <BulletList item><TextButton element="a" href="https://github.com/iceproductions">More of our work</TextButton></BulletList>
                </BulletList>
                <br />
                <MainButton element="a" href="https://discord.gg/JUTFUKH">Join our discord server</MainButton>
            </section>
            <section></section>
            <section></section>
        </main>
    );
}