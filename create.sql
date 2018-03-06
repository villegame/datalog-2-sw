create schema temp_mon_schema;

create table temp_mon_schema.settings (settings_id serial primary key, settings_name varchar(20), settings_value varchar(80));

create table temp_mon_schema.devices (
devices_id serial primary key, 
devices_name varchar(40), 
devices_source varchar(40), 
devices_enabled boolean, 
devices_type varchar(20),
devices_color varchar(10), 
devices_screen smallint, 
devices_screen_order smallint);

create table temp_mon_schema.values (
values_id serial primary key, 
devices_id integer not null, 
values_temperature numeric(9,2),
values_humidity numeric(9,2),
values_pressure numeric(9,2),
values_time bigint, 
constraint values_devices_id_fkey foreign key (devices_id) 
references temp_mon_schema.devices (devices_id) match simple on update cascade on delete cascade);

