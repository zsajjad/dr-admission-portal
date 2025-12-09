# Danishgah e Ramzan Admin Portal

This portal build with Next.js, MUI, React, TypeScript, and other modern technologies - will serve as a admin portal for the Danishgah e Ramzan admissions process.

## Architecture

APIs: All API are generated using orval, to regenerate API, run `npm run service:orval`
Components: All components are stored in `src/components` folder; component is a UI element that is used by multiple pages and is coupled with business logic.
Domains: All features are grouped as domains in `src/domains` folder; each domain has views, components, hooks, etc. Whatever is required to achieve a feature is grouped together in a domain.
Forms: All forms are build using formik and yup for validation. Yup validations schema is store in separate files for each form. Each form can be used for add/edit both support of providing edit item id in props.

## Requirements

### Admissions Module

Admissions module will allow admins to search for admissions based on session id, branch id, class level label, name, father name, phone.

Admin will be able to edit the admission details, that will update details of student as well.

Admin will be able to mark admission as verified, fee paid, finalized, etc.

### Question Set Module

Admin will be able to list all question sets, create new question set, edit question set, delete question set.
