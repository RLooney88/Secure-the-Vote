#!/usr/bin/env node

const { Client } = require('pg');

const connectionString = 'postgresql://postgres:xuDFleLFzoWrKvuMjcNCqFEuIjZAMriR@crossover.proxy.rlwy.net:37736/railway';

const posts = [
  {
    title: 'ELECTION ACCURACY CITIZEN ACTION GUIDE',
    slug: 'election-accuracy-citizen-action-guide',
    content: 'Secure the Vote MD (www.securethevotemd.com) exists to guarantee Maryland citizen\'s right to a secure and accurate election. We understand our elections are critical infrastructure and MUST be properly monitored and managed. We have filed a Notice of Appeal for our lawsuit that aims to force the State Board of Elections to address the 79,349 current voter registration violations and ensure accurate voter rolls.',
    excerpt: 'Secure the Vote MD exists to guarantee Maryland citizen\'s right to a secure and accurate election. We understand our elections are critical infrastructure and MUST be properly monitored and managed.',
    category: 'citizen-action',
    post_type: 'article',
    published_at: '2024-04-19'
  },
  {
    title: 'HOW TO TESTIFY AT THE MGA',
    slug: 'how-to-testify-at-the-mga',
    content: 'To sign-up to testify on a bill, you must first make a "MyMGA account". You can do so at https://mgaleg.maryland.gov/mgawebsite/Account/Register/Tracking. You will be asked to provide identifying information and a confirmation will be sent to your provided email address. The signup window for Senate bills is only available one business day ahead of a bill\'s hearing between the hours of 8am and 3pm. The signup window for House bills is only available two business days ahead. Once you\'ve signed in, navigate to "Witness Signup" and select the bill or bills you\'d like to testify on.',
    excerpt: 'To sign-up to testify on a bill, you must first make a "MyMGA account". Learn the process for signing up to testify before Maryland General Assembly committees.',
    category: 'citizen-action',
    post_type: 'article',
    published_at: '2024-04-19'
  },
  {
    title: 'POLL WATCHER\'S TOOLKIT',
    slug: 'poll-watchers-toolkit',
    content: 'Canvasser - Official paid, temporary Election worker who processes and counts the votes. Chosen by the local Board of Elections. Canvassing dates vary but, generally, Mail-in canvassing begins April 22nd and Provisional and Election Day ballots are counted beginning May 22nd and May 24th. Let us know if you would like to be recommended to be a Canvasser.',
    excerpt: 'Information about becoming a canvasser and election worker. Canvassing dates vary but generally Mail-in canvassing begins April 22nd.',
    category: 'citizen-action',
    post_type: 'article',
    published_at: '2024-05-01'
  },
  {
    title: 'Maryland Election Integrity LLC and United Sovereign Americans File a Reply Brief in the Case Against the Maryland State Board of Elections and Brennan Center for Justice at New York University School of Law',
    slug: 'maryland-election-integrity-llc-and-united-sovereign-americans-file-a-reply-brief-in-the-case-against-the-maryland-state-board-of-elections-and-brennan-center-for-justice-at-new-york-university-school',
    content: 'ANNAPOLIS, MD – August 29, 2024 Maryland Election Integrity LLC and United Sovereign Americans, represented by Ed Hartman of Hartman, Attorneys at Law and Bruce Castor Jr of van der Veen, Hartshorn, Levin, & Lindheim, filed a Reply Brief in response to the lower court\'s refusal to hear the case based on standing in the U.S. Court of Appeals for the Fourth Circuit. A strong reply to the court starts with a very compelling argument, "Appellee\'s arguments with respect to Maryland Election Integrity\'s standing are without merit and attempt to impose additional requirements never before required by this Court."',
    excerpt: 'Maryland Election Integrity LLC and United Sovereign Americans filed a Reply Brief in the U.S. Court of Appeals for the Fourth Circuit challenging the lower court\'s refusal to hear the case.',
    category: 'legal',
    post_type: 'press-release',
    published_at: '2024-08-29'
  },
  {
    title: 'Election Accuracy Day of Action Follow Up',
    slug: 'join-us-for-the-election-accuracy-day-of-action',
    content: 'Couldn\'t Make the Rally? You can still help! Make your voice heard with three simple steps. 1. Download the letter template below. Update the placeholder fields to match your information. 2. Look up your representative\'s contact information HERE. Add their address/email to the letter. 3. Send it out! Three steps in three minutes, makes a big difference!',
    excerpt: 'Couldn\'t Make the Rally? You can still help! Make your voice heard with three simple steps: download the letter template, look up your representative, and send it out.',
    category: 'citizen-action',
    post_type: 'article',
    published_at: '2025-01-24'
  },
  {
    title: 'Demand Maryland Voter ID and Signature Verification By David Morsberger',
    slug: 'demand-maryland-voter-id-and-signature-verification-by-david-morsberger',
    content: 'Transparent and fair elections are a non-partisan issue—they are the foundation of our Constitutional Republic. Without election integrity, we the American people lose faith in their government, and democracy itself is weakened. In February 2024, we delivered the "Restoring Faith in Maryland Elections" report to both the Maryland State Board of Elections and local election officials. Our report revealed serious issues, including duplicate voter registrations, voters who moved, and invalid residential addresses. Maryland\'s voter registration rate is 98.8% for all voters and 92.8% for active voters—numbers that defy logic. Howard County\'s voter registration is at 103%.',
    excerpt: 'Transparent and fair elections are a non-partisan issue—they are the foundation of our Constitutional Republic. The "Restoring Faith in Maryland Elections" report revealed serious issues.',
    category: 'citizen-action',
    post_type: 'article',
    published_at: '2025-03-05'
  },
  {
    title: 'Maryland Election Board Compliance: Ensuring Accountability and Transparency By Dale Livingston',
    slug: 'maryland-election-board-compliance-ensuring-accountability-and-transparency-by-dale-livingston',
    content: 'In recent years, Americans have become increasingly aware that some government agencies and elected officials are not adhering to the very rules, regulations, and laws they are responsible for creating and enforcing. Maryland has 24 election jurisdictions, one in each of its 23 counties and Baltimore City. These local election offices are funded by millions of taxpayer dollars allocated to ensure the smooth operation of elections. Not all local election offices comply with the Open Meetings Act, which guarantees public access to government board meetings. Secure the Vote Maryland is a grassroots organization made up of concerned citizens dedicated to bringing honesty, validity, security, accuracy, and transparency to our election system.',
    excerpt: 'Americans have become increasingly aware that some government agencies are not adhering to the rules and laws they are responsible for enforcing. Election boards are no exception.',
    category: 'news',
    post_type: 'article',
    published_at: '2025-03-11'
  },
  {
    title: 'Why Ranked Choice Voting Fails to Deliver Free, Fair, and Transparent Elections By Steve Brown',
    slug: 'why-ranked-choice-voting-fails-to-deliver-free-fair-and-transparent-elections-by-steve-brown',
    content: 'Ranked Choice Voting (RCV), also known as Instant Runoff Voting, is an alternative election system where voters rank candidates in order of preference. Proponents argue that RCV promotes majority support and reduces negative campaigning, but critics highlight several concerns about its impact on election integrity and voter participation. RCV does NOT promote Free, Fair, and Transparent elections. Issues include: voters cannot vote against a candidate, extreme candidates can win, moderates get squeezed out, ballot exhaustion, lower voter participation, confusing to voters, increased risk of election mismanagement and fraud, and reporting delays. Ten states have already BANNED rank choice voting due to these concerns.',
    excerpt: 'Ranked Choice Voting (RCV) is an alternative election system where voters rank candidates. Critics highlight several concerns about its impact on election integrity and voter participation.',
    category: 'news',
    post_type: 'article',
    published_at: '2025-03-11'
  },
  {
    title: 'Podcast: Election Accuracy Day of Action Recap',
    slug: 'podcast-election-accuracy-day-of-action-recap',
    content: 'SecuretheVoteMD recently hosted the Election Accuracy Day of Action, an event focused on educating citizens and elected representatives about best practices for securing our elections. This podcast segment recaps key discussions from the event, exploring essential policies and legislative efforts to strengthen election security, enhance transparency, and restore trust in our electoral process. Sessions include: Introduction & Background – Kate Sullivan, Importance of Voter ID & Signature Verification – David Morsberger, The Perils of Ranked Choice Voting – Steve Brown, Keeping Elections Low-Tech & Local – Dale Livingston, Why Only Citizens Can Vote – Jay Kaminsky, Turning Information into Action – Kate Sullivan.',
    excerpt: 'SecuretheVoteMD hosted the Election Accuracy Day of Action, educating citizens and elected representatives about best practices for securing our elections.',
    category: 'news',
    post_type: 'article',
    published_at: '2025-03-18'
  },
  {
    title: 'Response to the Maryland State Board of Elections\' Statement on President Trump\'s Executive Order',
    slug: 'response-to-the-maryland-state-board-of-elections-statement-on-president-trumps-executive-order',
    content: 'The Maryland State Board of Elections (SBE), through Administrator Jared DeMarinis, expressed disappointment that President Trump\'s Executive Order did not address misinformation and voter intimidation. This assertion is concerning. The SBE has repeatedly suggested that misinformation and voter intimidation are significant issues in Maryland, yet there is no publicly available evidence supporting these claims.',
    excerpt: 'The Maryland State Board of Elections expressed disappointment that President Trump\'s Executive Order did not address misinformation and voter intimidation—yet no evidence supports these claims.',
    category: 'news',
    post_type: 'press-release',
    published_at: '2025-03-31'
  },
  {
    title: 'Secure the Vote Maryland Testifies Against Redistricting Bill HB488',
    slug: 'secure-the-vote-maryland-testifies-against-redistricting-bill-hb488',
    content: 'Witness: Katherine Strauch Sullivan, Jurisdiction: Baltimore County, Bill: HB488 Election Districts – General Assembly and Representatives in Congress, Position: AGAINST HB488. HB488 is nothing but a political stunt forced on us by Governor Moore for his own self-serving political ambitions. It is clearly designed to manipulate district lines for partisan advantage rather than to address legitimate demographic or constitutional concerns. Such gerrymandering erodes voter confidence, undermines faith in elections, and reinforces the perception that Annapolis prioritizes political games over the real problems facing Marylanders.',
    excerpt: 'Secure the Vote Maryland testified against HB488, calling it a political stunt designed to manipulate district lines for partisan advantage rather than address legitimate concerns.',
    category: 'news',
    post_type: 'article',
    published_at: '2026-02-03'
  },
  {
    title: 'Secure the Vote Maryland Hosts Successful Lobby Day – Filing of the Secure the Vote Act of 2026',
    slug: 'secure-the-vote-maryland-hosts-successful-lobby-day-filing-of-the-secure-the-vote-act-of-2026',
    content: 'Annapolis, Maryland – February 6, 2026. On Wednesday, February 4, concerned citizens from across Maryland volunteered their time in Annapolis to advocate for the Secure the Vote Act of 2026, a sweeping election integrity bill formally filed at 4:59 PM in the Maryland State House. The Secure the Vote Act of 2026, developed in collaboration with the Maryland Freedom Caucus, was designed to address every known vulnerability in Maryland\'s election system and establish the strongest election safeguards in state history. Key provisions include: Voter Identification, Proof of U.S. Citizenship, Prohibition on Non-Citizen Voting in Municipal Elections, Elimination of Ballot Drop Boxes, Repeal of No-Excuse Mail-In Voting, and Signature Verification for Absentee Ballots.',
    excerpt: 'On February 4, 2026, concerned citizens advocated for the Secure the Vote Act of 2026, a sweeping election integrity bill addressing every known vulnerability in Maryland\'s election system.',
    category: 'news',
    post_type: 'press-release',
    published_at: '2026-02-07'
  },
  {
    title: 'Big Win for Maryland Election Integrity — Secure the Vote Act of 2026 (House Bill 964) Filed!',
    slug: 'big-win-for-maryland-election-integrity-secure-the-vote-act-of-2026-house-bill-964-filed',
    content: 'On Wednesday, February 4, 2026, the Secure the Vote Act of 2026 was officially filed as House Bill 964 in the Maryland General Assembly! House Bill 964 makes comprehensive reforms to strengthen Maryland\'s election laws including: Solidifying Voter ID Requirements, Ensuring Only U.S. Citizens Can Register and Vote, Strengthening Voter Registration Integrity, Tightening Absentee Voting Rules and Signature Verification. The bill establishes clear requirements for identification at the polling place, requiring voters to present valid government-issued photo ID. New provisions require documentary proof of U.S. citizenship when registering to vote. Before each statewide primary, the State Board must conduct a full audit of the voter registration list.',
    excerpt: 'The Secure the Vote Act of 2026 was officially filed as House Bill 964, making comprehensive reforms to strengthen Maryland\'s election laws with voter ID, citizenship verification, and more.',
    category: 'news',
    post_type: 'press-release',
    published_at: '2026-02-09'
  }
];

async function importPosts() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    let imported = 0;
    let skipped = 0;
    
    for (const post of posts) {
      try {
        const result = await client.query(
          `INSERT INTO posts (title, slug, content, excerpt, category, post_type, status, published_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, $7)
           ON CONFLICT (slug) DO NOTHING
           RETURNING id`,
          [
            post.title,
            post.slug,
            post.content,
            post.excerpt,
            post.category,
            post.post_type,
            post.published_at
          ]
        );
        
        if (result.rowCount > 0) {
          console.log(`✓ Imported: ${post.title}`);
          imported++;
        } else {
          console.log(`- Skipped (exists): ${post.title}`);
          skipped++;
        }
      } catch (err) {
        console.error(`✗ Error importing ${post.title}:`, err.message);
      }
    }
    
    console.log(`\n=== IMPORT COMPLETE ===`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${posts.length}`);
    
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

importPosts();
