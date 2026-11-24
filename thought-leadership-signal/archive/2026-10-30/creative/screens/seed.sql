INSERT OR REPLACE INTO setting(key,value) VALUES ('lock_face','0'),('current_tag','IBW');
INSERT INTO person(id,display_name,real_name,recognise_hint,state,starred,summary,company,role,created_at,updated_at) VALUES
('p1','Arjun Mehta','Arjun Mehta','Green hoodie, met at the zk prover panel','kept',1,'Founder building a GPU prover network. Hiring two Rust engineers before Devcon.','Kiln Provers','Founder','2026-10-29T13:52:00Z','2026-10-29T13:52:00Z'),
('p2','Priya Nair','Priya Nair',NULL,'kept',0,'Researches restaking risk. Wants feedback on her ETHGlobal idea.','Tessera Labs','Researcher','2026-10-29T12:40:00Z','2026-10-29T12:40:00Z'),
('p3','Kavya Rao',NULL,NULL,'kept',0,NULL,'Lumen Rollup','DevRel','2026-10-29T11:15:00Z','2026-10-29T11:15:00Z'),
('p4','Rohan Shah',NULL,NULL,'needs_review',0,NULL,'Saffron Ventures','Partner','2026-10-29T10:05:00Z','2026-10-29T10:05:00Z'),
('p5','Meera Iyer',NULL,NULL,'kept',1,NULL,'Monsoon Wallet','Design lead','2026-10-29T08:30:00Z','2026-10-29T08:30:00Z'),
('p6','dev_sharma.eth',NULL,NULL,'stub',0,NULL,NULL,NULL,'2026-10-29T07:50:00Z','2026-10-29T07:50:00Z');
INSERT INTO handle(id,person_id,platform,value,url,status,confidence,score,display_name,bio,followers,source_provider,confirmed_at) VALUES
('h1','p1','x','degenwizard','https://x.com/degenwizard','anchor',NULL,NULL,'Arjun','proving things, slowly then all at once',4210,'qr','2026-10-29T13:52:00Z'),
('h2','p1','telegram','arjun_zk','https://t.me/arjun_zk','confirmed','high',0.93,'Arjun Mehta',NULL,NULL,'bio-link','2026-10-29T13:55:00Z'),
('h3','p1','linkedin','arjun-mehta-zk','https://www.linkedin.com/in/arjun-mehta-zk','suggested','high',0.88,'Arjun Mehta','Founder at Kiln Provers',NULL,'search',NULL),
('h4','p1','ens','arjunm.eth',NULL,'suggested','medium',0.61,'arjunm.eth',NULL,NULL,'web3.bio',NULL),
('h5','p1','farcaster','arjunm',NULL,'suggested','low',0.32,'arjun',NULL,NULL,'web3.bio',NULL),
('h6','p2','x','priya_zk','https://x.com/priya_zk','anchor',NULL,NULL,'Priya',NULL,NULL,'qr',NULL),
('h7','p3','linkedin','kavya-rao','https://www.linkedin.com/in/kavya-rao','anchor',NULL,NULL,'Kavya Rao',NULL,NULL,'qr',NULL),
('h8','p5','telegram','meera_designs','https://t.me/meera_designs','anchor',NULL,NULL,'Meera',NULL,NULL,'qr',NULL),
('h9','p6','ens','dev_sharma.eth',NULL,'anchor',NULL,NULL,NULL,NULL,NULL,'qr',NULL);
INSERT INTO encounter(id,person_id,at,lat,lng,raw_qr,qr_kind,transcript,ai_json,review_state,tag) VALUES
('e1','p1','2026-10-29T13:52:00Z',19.0626,72.8657,'https://x.com/degenwizard','x','Met Arjun after the prover panel. He runs Kiln, a GPU prover network, and is hiring two Rust engineers before Devcon. I promised to intro him to Ravi. He will send the deck on Telegram.','{"person":{"name":"Arjun Mehta","role":"Founder","company":"Kiln Provers","what_they_do":"GPU prover network"},"topics":["zk provers","hiring Rust engineers","Devcon"],"they_need":["two Rust engineers"],"can_help_me_with":["prover benchmarks"],"actions":[{"text":"Intro Arjun to Ravi","owner":"me","due":"2026-10-30","channel":"telegram"},{"text":"Send the Kiln deck","owner":"them","due":null,"channel":"telegram"}],"tags":["IBW"],"evidence":{},"draft_followup":"Hey Arjun, great meeting you after the prover panel. Connecting you with Ravi now."}','reviewed','IBW'),
('e2','p2','2026-10-29T12:40:00Z',19.0626,72.8657,'https://x.com/priya_zk','x',NULL,NULL,'reviewed','IBW'),
('e3','p3','2026-10-29T11:15:00Z',19.0626,72.8657,NULL,'linkedin',NULL,NULL,'reviewed','IBW'),
('e4','p4','2026-10-29T10:05:00Z',19.0626,72.8657,NULL,NULL,NULL,NULL,'pending','IBW'),
('e5','p5','2026-10-29T08:30:00Z',19.0626,72.8657,NULL,'telegram',NULL,NULL,'reviewed','IBW'),
('e6','p6','2026-10-29T07:50:00Z',19.0626,72.8657,NULL,'ens',NULL,NULL,'pending','IBW');
INSERT INTO action(id,person_id,encounter_id,text,owner,due,channel,draft) VALUES
('a1','p1','e1','Intro Arjun to Ravi','me','2026-10-30','telegram','Hey Arjun, great meeting you after the prover panel. Connecting you with Ravi now.'),
('a2','p1','e1','Send the Kiln deck','them',NULL,'telegram',NULL),
('a3','p2','e2','Review her ETHGlobal idea','me','2026-11-02','x','Priya, read your restaking note. Two thoughts before ETHGlobal.'),
('a4','p5','e5','Share the Glance build','me','2026-10-28','telegram','Meera, here is the build I showed you.'),
('a5','p3','e3','Docs feedback call','me','2026-10-31','linkedin','Kavya, free Saturday for that docs call?');
